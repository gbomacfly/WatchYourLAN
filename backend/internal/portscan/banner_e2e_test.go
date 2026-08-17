package portscan

import (
	"net"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"testing"
	"time"
)

// TestGrabBannerGreetingFirst simulates a service like SSH that sends its banner
// immediately on connect, without waiting for the client to speak first.
func TestGrabBannerGreetingFirst(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	defer ln.Close()

	go func() {
		conn, err := ln.Accept()
		if err != nil {
			return
		}
		defer conn.Close()
		conn.Write([]byte("SSH-2.0-OpenSSH_9.6\r\n"))
		time.Sleep(300 * time.Millisecond)
	}()

	host, port, _ := net.SplitHostPort(ln.Addr().String())
	got := GrabBanner(host, port)

	if got != "SSH-2.0-OpenSSH_9.6" {
		t.Errorf("GrabBanner() = %q, want %q", got, "SSH-2.0-OpenSSH_9.6")
	}
}

// TestGrabBannerHTTP simulates a service like a web server that only responds once the
// client sends something - GrabBanner should fall back to sending a HEAD request.
func TestGrabBannerHTTP(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Server", "wyl-e2e-test/1.0")
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	u := strings.TrimPrefix(srv.URL, "http://")
	host, portStr, _ := net.SplitHostPort(u)
	if _, err := strconv.Atoi(portStr); err != nil {
		t.Fatalf("could not parse test server port from %q", u)
	}

	got := GrabBanner(host, portStr)

	if !strings.Contains(got, "wyl-e2e-test/1.0") {
		t.Errorf("GrabBanner() = %q, want it to contain the Server header value", got)
	}
	if !strings.HasPrefix(got, "HTTP/") {
		t.Errorf("GrabBanner() = %q, want it to start with the HTTP status line", got)
	}
}

// TestGrabBannerNothingListening makes sure a closed/unreachable port fails soft (empty
// string), never a panic or hang.
func TestGrabBannerNothingListening(t *testing.T) {
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("listen: %v", err)
	}
	host, port, _ := net.SplitHostPort(ln.Addr().String())
	ln.Close() // close immediately so the port is free but nothing answers

	got := GrabBanner(host, port)
	if got != "" {
		t.Errorf("GrabBanner() on closed port = %q, want empty string", got)
	}
}
