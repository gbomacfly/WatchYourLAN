// Package oui keeps arp-scan's MAC vendor database (ieee-oui.txt) up to date.
//
// The file baked into the arp-scan Alpine package goes stale over time, which shows up
// as more and more devices with an "(Unknown: locally administered)" or blank Hardware
// field. Instead of asking users to download and mount this file by hand, we fetch
// Wireshark's manuf database (which tracks the IEEE registries and includes vendor long
// names arp-scan's own upstream copy often lacks, e.g. "FRITZ! Technology GmbH" instead
// of a blank/generic AVM entry) and convert it into the format arp-scan expects.
package oui

import (
	"bufio"
	"io"
	"log/slog"
	"net/http"
	"os"
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
// entries (verified against the working reference awk conversion). 30,000 used to be the
// bar here, which is exactly why a silently-truncated ~51,000-line download (a real
// incident, not hypothetical) sailed through undetected. Set well above any plausible
// short-term shrink of the real database, but comfortably below the true count, so a
// genuinely truncated/garbage response (HTML error page, half a file) still gets caught.
const minValidLines = 55_000

// httpClient - short-lived client just for this download
var httpClient = &http.Client{Timeout: 30 * time.Second}

// Update - download the latest manuf database, convert it to arp-scan's ieee-oui.txt
// format, and atomically replace the file arp-scan uses. Never fatal: on any failure it
// logs a warning and leaves the existing file (the one shipped in the arp-scan package,
// or whatever was fetched last time) untouched.
func Update() {

	slog.Info("Updating arp-scan MAC vendor database", "url", sourceURL)

	req, err := http.NewRequest(http.MethodGet, sourceURL, nil)
	if check.IfError(err) {
		return
	}
	// Some CDNs/WAFs serve a reduced or cached response to requests without a browser-like
	// User-Agent (Go's http.Client sends "Go-http-client/1.1" by default). Look like curl,
	// which is known to get the full file, to rule that out as a source of silent truncation.
	req.Header.Set("User-Agent", "curl/8.0")

	resp, err := httpClient.Do(req)
	if check.IfError(err) {
		slog.Warn("Could not reach OUI source, keeping existing vendor database")
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		slog.Warn("Unexpected response fetching OUI database, keeping existing one", "status", resp.StatusCode)
		return
	}

	body, err := io.ReadAll(resp.Body)
	if check.IfError(err) {
		return
	}

	// A response that claims a Content-Length but delivers less (a truncated/reset
	// connection that io.ReadAll didn't surface as an error) must not be treated as success.
	if resp.ContentLength > 0 && int64(len(body)) != resp.ContentLength {
		slog.Warn("Downloaded OUI database size doesn't match Content-Length, keeping existing one",
			"content_length", resp.ContentLength, "got_bytes", len(body))
		return
	}

	slog.Debug("Downloaded raw OUI source", "bytes", len(body))

	converted, lines, err := convertManuf(body)
	if err != nil {
		slog.Warn("Failed to fully parse downloaded OUI database, keeping existing one", "error", err)
		return
	}

	if lines < minValidLines {
		slog.Warn("Converted OUI database looks too small, keeping existing one", "lines", lines)
		return
	}

	dir := filepath.Dir(targetPath)
	if err = os.MkdirAll(dir, 0o755); check.IfError(err) {
		return
	}

	tmpFile, err := os.CreateTemp(dir, ".ieee-oui-*.tmp")
	if check.IfError(err) {
		return
	}
	tmpPath := tmpFile.Name()
	defer os.Remove(tmpPath) // no-op once the rename below succeeds

	if _, err = tmpFile.Write(converted); check.IfError(err) {
		tmpFile.Close()
		return
	}
	if err = tmpFile.Close(); check.IfError(err) {
		return
	}

	if err = os.Chmod(tmpPath, 0o644); check.IfError(err) {
		return
	}

	if err = os.Rename(tmpPath, targetPath); check.IfError(err) {
		return
	}

	slog.Info("OUI vendor database updated", "path", targetPath, "lines", lines)
}

// convertManuf converts Wireshark's manuf file into arp-scan's ieee-oui.txt format:
// one entry per line, "<hex prefix><TAB><vendor name>". Based on this awk conversion:
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
//
// One deliberate difference from that awk version: the long vendor name (3rd field) is
// preferred when present (e.g. "FRITZ! Technology GmbH" instead of a blank/generic AVM
// entry), but a line that only has a short name (2nd field, no 3rd field at all) is still
// kept using that short name, rather than dropped. Smaller/newer IEEE registrations often
// only carry a short name in the manuf file - requiring a long name would silently lose
// those vendors entirely instead of just showing a slightly less pretty name for them.
//
// Returns an error if the scan stops before reaching the end of the input (e.g. a single
// line exceeding bufio.Scanner's token limit, or a read error) - callers must treat that
// as a failed conversion, not a shorter-but-valid one: bufio.Scanner silently stops on the
// first error, which would otherwise produce a truncated file that still clears
// minValidLines by chance and gets written out missing everything past that point.
func convertManuf(body []byte) (out []byte, lines int, err error) {

	var buf strings.Builder
	scanner := bufio.NewScanner(strings.NewReader(string(body)))
	// A handful of manuf lines run long (vendor names with extra detail); give the scanner
	// plenty of headroom well beyond bufio.Scanner's 64KB default so none of them silently
	// truncate the scan.
	scanner.Buffer(make([]byte, 0, 64*1024), 1024*1024)

	for scanner.Scan() {
		line := scanner.Text()

		if strings.HasPrefix(line, "#") {
			continue
		}

		fields := strings.Split(line, "\t")
		if len(fields) < 2 {
			continue
		}

		addr := fields[0]
		prefixLen := 24

		if idx := strings.Index(addr, "/"); idx != -1 {
			parsed, err := strconv.Atoi(addr[idx+1:])
			if err != nil {
				continue
			}
			addr = addr[:idx]
			prefixLen = parsed
		}

		// Normalize to uppercase: the manuf file mixes case across entries, and
		// arp-scan's own ieee-oui.txt convention (and matching, per its docs) treats
		// hex digits case-insensitively, but keeping output consistent avoids any doubt.
		addr = strings.ToUpper(strings.ReplaceAll(addr, ":", ""))

		hexLen := prefixLen / 4
		if hexLen <= 0 || hexLen > len(addr) {
			continue
		}

		// Prefer the long vendor name (3rd field) when present; some entries -
		// often smaller/newer registrations - only carry the short name (2nd
		// field). Use that instead of dropping the entry outright.
		var vendor string
		if len(fields) >= 3 {
			vendor = strings.TrimSpace(fields[2])
		}
		if vendor == "" {
			vendor = strings.TrimSpace(fields[1])
		}
		if vendor == "" {
			continue
		}

		buf.WriteString(addr[:hexLen])
		buf.WriteByte('\t')
		buf.WriteString(vendor)
		buf.WriteByte('\n')
		lines++
	}

	if scanErr := scanner.Err(); scanErr != nil {
		return nil, 0, scanErr
	}

	return []byte(buf.String()), lines, nil
}
