// Package oui keeps arp-scan's MAC vendor database (ieee-oui.txt) up to date.
//
// The file baked into the arp-scan Alpine package goes stale over time, which shows up
// as more and more devices with an "(Unknown: locally administered)" or blank Hardware
// field. Instead of asking users to download and mount this file by hand, we fetch an
// already-converted copy from the arp-scan project itself (which maintains it in exactly
// the format arp-scan expects, sourced from IEEE's public registry) and drop it in place
// on a schedule.
package oui

import (
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gbomacfly/WatchYourLAN/internal/check"
)

// sourceURL - upstream, pre-converted copy of the IEEE OUI database
const sourceURL = "https://raw.githubusercontent.com/royhills/arp-scan/master/ieee-oui.txt"

// targetPath - where arp-scan looks for it by default (see Dockerfile: apk add arp-scan)
const targetPath = "/usr/share/arp-scan/ieee-oui.txt"

// minValidSize - a real ieee-oui.txt is several MB; bail out if we got something much
// smaller (e.g. an HTML error page), so we never clobber a working file with garbage
const minValidSize = 100_000

// httpClient - short-lived client just for this download
var httpClient = &http.Client{Timeout: 30 * time.Second}

// Update - download the latest ieee-oui.txt and atomically replace the one arp-scan uses.
// Never fatal: on any failure it logs a warning and leaves the existing file (the one
// shipped in the arp-scan package, or whatever was fetched last time) untouched.
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

	if len(body) < minValidSize {
		slog.Warn("Downloaded OUI database looks too small, keeping existing one", "bytes", len(body))
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

	if _, err = tmpFile.Write(body); check.IfError(err) {
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

	slog.Info("OUI vendor database updated", "path", targetPath, "bytes", len(body))
}
