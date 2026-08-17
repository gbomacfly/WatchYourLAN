package portscan

import (
	"crypto/tls"
	"fmt"
	"net"
	"strings"
	"time"
)

// tlsPorts - ports commonly running TLS-wrapped services. GrabBanner uses this to decide
// whether to speak plain TCP or do a TLS handshake first.
var tlsPorts = map[string]bool{
	"443":  true, // HTTPS
	"465":  true, // SMTPS
	"636":  true, // LDAPS
	"993":  true, // IMAPS
	"995":  true, // POP3S
	"2376": true, // Docker (TLS)
	"5986": true, // WinRM (HTTPS)
	"6443": true, // Kubernetes API
	"8443": true, // HTTPS (alt)
	"8883": true, // MQTT (TLS)
	"9443": true, // HTTPS (alt)
}

const (
	bannerDialTimeout = 3 * time.Second
	bannerReadTimeout = 2 * time.Second
	maxBannerBytes    = 512
	maxBannerLen      = 160
)

// GrabBanner connects to an already-known-open TCP port and tries to read a short
// greeting/banner. Protocols that greet first (SSH, FTP, SMTP, POP3, IMAP, and their TLS
// equivalents) are handled by just reading after connecting. Protocols that expect the
// client to speak first (HTTP and friends) are handled by sending a minimal HEAD request
// and reading the response. Returns an empty string if nothing useful could be read -
// this is best-effort, not every service will hand out a banner.
func GrabBanner(host, port string) string {
	target := fmt.Sprintf("%s:%s", host, port)
	dialer := net.Dialer{Timeout: bannerDialTimeout}

	var conn net.Conn
	var err error

	if tlsPorts[port] {
		conn, err = tls.DialWithDialer(&dialer, "tcp", target, &tls.Config{InsecureSkipVerify: true})
	} else {
		conn, err = dialer.Dial("tcp", target)
	}
	if err != nil {
		return ""
	}
	defer conn.Close()

	if banner := readBanner(conn); banner != "" {
		return cleanBanner(banner)
	}

	// Nothing volunteered - most things that don't greet first are HTTP(S).
	fmt.Fprintf(conn, "HEAD / HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n", host)
	return cleanBanner(extractHTTPBanner(readBanner(conn)))
}

func readBanner(conn net.Conn) string {
	_ = conn.SetReadDeadline(time.Now().Add(bannerReadTimeout))
	buf := make([]byte, maxBannerBytes)
	n, _ := conn.Read(buf)
	return string(buf[:n])
}

// extractHTTPBanner pulls the status line and Server header out of a raw HTTP response,
// since that's the useful part - the rest is headers/body we don't care about here.
func extractHTTPBanner(resp string) string {
	if resp == "" {
		return ""
	}

	statusLine := ""
	server := ""

	for _, line := range strings.Split(resp, "\n") {
		line = strings.TrimRight(line, "\r")
		if statusLine == "" && strings.HasPrefix(line, "HTTP/") {
			statusLine = line
		}
		if len(line) > 7 && strings.EqualFold(line[:7], "server:") {
			server = strings.TrimSpace(line[7:])
		}
	}

	switch {
	case server != "" && statusLine != "":
		return statusLine + " · " + server
	case server != "":
		return server
	default:
		return statusLine
	}
}

func cleanBanner(s string) string {
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, "\r", "")
	s = strings.ReplaceAll(s, "\n", " ")
	s = strings.Join(strings.Fields(s), " ") // collapse repeated whitespace

	runes := []rune(s)
	if len(runes) > maxBannerLen {
		s = string(runes[:maxBannerLen]) + "…"
	}
	return s
}
