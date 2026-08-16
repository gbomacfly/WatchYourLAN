// Package oui keeps arp-scan's MAC vendor database (ieee-oui.txt) up to date.
//
// The file baked into the arp-scan Alpine package goes stale over time, which shows up
// as more and more devices with an "(Unknown: locally administered)" or blank Hardware
// field. Instead of asking users to download and mount this file by hand, we fetch
// Wireshark's manuf database (which tracks the IEEE registries and includes vendor long
// names arp-scan's own upstream copy often lacks, e.g. "FRITZ! Technology GmbH" instead
// of a blank/generic AVM entry) and convert it into the format arp-scan expects.
//
// This runs the exact curl+awk pipeline verified to work reliably by hand (curl to a file,
// then this awk script converting it), rather than a Go reimplementation of the parsing.
// Earlier versions here re-parsed the manuf file in Go (first via net/http, then via a
// curl subprocess feeding a Go scanner) and both reproducibly returned a shorter file
// (~51,000 lines) than a plain interactive `curl | awk` run (~58,000 lines) on the exact
// same container, same URL, moments apart - a real, unexplained discrepancy that ate a lot
// of debugging time without a conclusive root cause. Since the interactive pipeline is the
// one that has actually been dependable, this shells out to that pipeline verbatim instead
// of trying to out-clever it in Go.
package oui

import (
	"bytes"
	"context"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gbomacfly/WatchYourLAN/internal/check"
)

// sourceURL - Wireshark's manuf database (prefix + short + long vendor name), rebuilt
// from the IEEE MA-L/MA-M/MA-S registries and kept current by the Wireshark project.
const sourceURL = "https://www.wireshark.org/download/automated/data/manuf"

// targetPath - where arp-scan looks for it by default (see Dockerfile: apk add arp-scan)
const targetPath = "/usr/share/arp-scan/ieee-oui.txt"

// minValidLines - a full, correctly-converted manuf file currently produces ~58,000
// entries (verified against this exact awk script run by hand). 30,000 used to be the bar
// here, which is exactly why a silently-truncated ~51,000-line result sailed through
// undetected in earlier versions of this file. Set well above any plausible short-term
// shrink of the real database, but comfortably below the true count, so a genuinely
// truncated/garbage result (HTML error page, half a file) still gets caught.
const minValidLines = 55_000

// downloadTimeout - how long the curl download is allowed to take before we give up.
const downloadTimeout = 30 * time.Second

// awkScript - converts a raw manuf line into arp-scan's ieee-oui.txt format
// ("<hex prefix><TAB><vendor long name>"), verbatim from the working reference script:
//
//	awk -F'\t' '
//	!/^#/ && NF>=3 {
//	  addr=$1
//	  prefixlen=24
//	  if (addr ~ /\//) {
//	    split(addr, parts, "/")
//	    addr=parts[1]
//	    prefixlen=parts[2]+0
//	  }
//	  gsub(":", "", addr)
//	  hexlen=prefixlen/4
//	  print substr(addr, 1, hexlen) "\t" $3
//	}'
const awkScript = `
!/^#/ && NF>=3 {
  addr=$1
  prefixlen=24
  if (addr ~ /\//) {
    split(addr, parts, "/")
    addr=parts[1]
    prefixlen=parts[2]+0
  }
  gsub(":", "", addr)
  hexlen=prefixlen/4
  print substr(addr, 1, hexlen) "\t" $3
}`

// Update - download the latest manuf database, convert it to arp-scan's ieee-oui.txt
// format via the awkScript above, and atomically replace the file arp-scan uses. Never
// fatal: on any failure it logs a warning and leaves the existing file (the one shipped in
// the arp-scan package, or whatever was fetched last time) untouched.
func Update() {

	slog.Info("Updating arp-scan MAC vendor database", "url", sourceURL)

	tmpDir, err := os.MkdirTemp("", "wyl-oui-*")
	if check.IfError(err) {
		return
	}
	defer os.RemoveAll(tmpDir)

	rawPath := filepath.Join(tmpDir, "manuf.raw")
	convertedPath := filepath.Join(tmpDir, "ieee-oui.converted")

	ctx, cancel := context.WithTimeout(context.Background(), downloadTimeout)
	defer cancel()

	// [1/3] Download, exactly as: curl -fsSL -o "$TMP_FILE" "$MANUF_URL"
	curlCmd := exec.CommandContext(ctx, "curl", "-fsSL", "-o", rawPath, sourceURL)
	var curlStderr bytes.Buffer
	curlCmd.Stderr = &curlStderr

	if err := curlCmd.Run(); err != nil {
		slog.Warn("Could not download OUI source, keeping existing vendor database",
			"error", err, "stderr", strings.TrimSpace(curlStderr.String()))
		return
	}

	// [2/3] Convert, exactly as: awk -F'\t' '<awkScript>' "$TMP_FILE" > "${TARGET_FILE}.new"
	outFile, err := os.Create(convertedPath)
	if check.IfError(err) {
		return
	}
	var awkStderr bytes.Buffer
	// gawk specifically (not the ambiguous "awk", which on Alpine could resolve to
	// busybox's much more limited applet depending on what else pulls it in) - matches
	// what the working reference script runs on a typical Linux host.
	awkCmd := exec.Command("gawk", "-F\t", awkScript, rawPath)
	awkCmd.Stdout = outFile
	awkCmd.Stderr = &awkStderr

	awkErr := awkCmd.Run()
	outFile.Close()

	if awkErr != nil {
		slog.Warn("Could not convert downloaded OUI database, keeping existing one",
			"error", awkErr, "stderr", strings.TrimSpace(awkStderr.String()))
		return
	}

	lines, err := countLines(convertedPath)
	if check.IfError(err) {
		return
	}

	// [3/3] Validate, exactly as: LINES check + move, matching the reference script's guard.
	if lines < minValidLines {
		slog.Warn("Converted OUI database looks too small, keeping existing one", "lines", lines)
		return
	}

	dir := filepath.Dir(targetPath)
	if err = os.MkdirAll(dir, 0o755); check.IfError(err) {
		return
	}

	if err = os.Chmod(convertedPath, 0o644); check.IfError(err) {
		return
	}

	// Cross-filesystem-safe move: os.Rename fails with EXDEV if tmpDir and targetPath's dir
	// are on different filesystems/mounts, unlike a same-directory temp file would be. Try
	// rename first (the common, atomic case), fall back to copy+remove otherwise.
	if err = os.Rename(convertedPath, targetPath); err != nil {
		if copyErr := copyFile(convertedPath, targetPath); copyErr != nil {
			slog.Warn("Could not install converted OUI database, keeping existing one", "error", copyErr)
			return
		}
	}

	slog.Info("OUI vendor database updated", "path", targetPath, "lines", lines)
}

func countLines(path string) (int, error) {
	body, err := os.ReadFile(path)
	if err != nil {
		return 0, err
	}
	if len(body) == 0 {
		return 0, nil
	}
	n := strings.Count(string(body), "\n")
	// Count a final line even if it has no trailing newline.
	if body[len(body)-1] != '\n' {
		n++
	}
	return n, nil
}

func copyFile(src, dst string) error {
	body, err := os.ReadFile(src)
	if err != nil {
		return err
	}
	tmp := dst + ".tmp"
	if err := os.WriteFile(tmp, body, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, dst)
}

// convertManuf mirrors awkScript above in Go, kept only so the conversion logic itself
// stays covered by fast unit tests without needing awk/curl available in the test
// environment. Update() above does NOT call this - it shells out to the real awk script,
// per the "run the exact working pipeline" decision explained at the top of this file.
func convertManuf(body []byte) (out []byte, lines int, err error) {

	var buf strings.Builder

	for _, line := range strings.Split(string(body), "\n") {
		line = strings.TrimSuffix(line, "\r")

		if strings.HasPrefix(line, "#") {
			continue
		}

		fields := strings.Split(line, "\t")
		if len(fields) < 3 {
			continue
		}

		addr := fields[0]
		prefixLen := 24

		if idx := strings.Index(addr, "/"); idx != -1 {
			parsed, convErr := strconv.Atoi(addr[idx+1:])
			if convErr != nil {
				continue
			}
			addr = addr[:idx]
			prefixLen = parsed
		}

		addr = strings.ReplaceAll(addr, ":", "")

		hexLen := prefixLen / 4
		if hexLen <= 0 {
			continue
		}
		if hexLen > len(addr) {
			// Mirror awk's substr(), which just returns what's available rather than
			// erroring when asked for more characters than the string has.
			hexLen = len(addr)
		}

		vendor := fields[2]

		buf.WriteString(addr[:hexLen])
		buf.WriteByte('\t')
		buf.WriteString(vendor)
		buf.WriteByte('\n')
		lines++
	}

	return []byte(buf.String()), lines, nil
}
