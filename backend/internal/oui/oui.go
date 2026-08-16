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

// minValidLines - a real conversion produces tens of thousands of entries; bail out if we
// got a lot less (e.g. an HTML error page or a truncated download), so we never clobber a
// working file with garbage.
const minValidLines = 30_000

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

	converted, lines := convertManuf(body)

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
func convertManuf(body []byte) (out []byte, lines int) {

	var buf strings.Builder
	scanner := bufio.NewScanner(strings.NewReader(string(body)))

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

	return []byte(buf.String()), lines
}
