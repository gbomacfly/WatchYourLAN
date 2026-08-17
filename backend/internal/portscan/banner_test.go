package portscan

import "testing"

func TestExtractHTTPBanner(t *testing.T) {
	cases := []struct {
		name string
		resp string
		want string
	}{
		{
			name: "status and server header",
			resp: "HTTP/1.1 200 OK\r\nServer: nginx/1.25.3\r\nContent-Type: text/html\r\n\r\n<html>",
			want: "HTTP/1.1 200 OK · nginx/1.25.3",
		},
		{
			name: "status only, no server header",
			resp: "HTTP/1.1 401 Unauthorized\r\nWWW-Authenticate: Basic\r\n\r\n",
			want: "HTTP/1.1 401 Unauthorized",
		},
		{
			name: "server header case-insensitive",
			resp: "HTTP/1.0 200 OK\r\nSERVER: lighttpd/1.4.55\r\n\r\n",
			want: "HTTP/1.0 200 OK · lighttpd/1.4.55",
		},
		{
			name: "empty response",
			resp: "",
			want: "",
		},
		{
			name: "not an http response at all",
			resp: "garbage\r\nnot http\r\n",
			want: "",
		},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := extractHTTPBanner(c.resp)
			if got != c.want {
				t.Errorf("extractHTTPBanner(%q) = %q, want %q", c.resp, got, c.want)
			}
		})
	}
}

func TestCleanBanner(t *testing.T) {
	cases := []struct {
		name string
		in   string
		want string
	}{
		{"trims whitespace", "  SSH-2.0-OpenSSH_9.6  \r\n", "SSH-2.0-OpenSSH_9.6"},
		{"collapses internal whitespace/newlines", "220  mail.example.com\r\nESMTP  Postfix", "220 mail.example.com ESMTP Postfix"},
	}

	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			got := cleanBanner(c.in)
			if got != c.want {
				t.Errorf("cleanBanner(%q) = %q, want %q", c.in, got, c.want)
			}
		})
	}

	long := ""
	for i := 0; i < 200; i++ {
		long += "x"
	}
	got := cleanBanner(long)
	if len(([]rune)(got)) != maxBannerLen+1 { // +1 for the trailing "…" rune
		t.Errorf("cleanBanner did not truncate: got length %d, want %d", len(([]rune)(got)), maxBannerLen+1)
	}
}
