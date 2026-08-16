package oui

import (
	"strings"
	"testing"
)

func TestConvertManuf(t *testing.T) {
	sample := strings.Join([]string{
		"# This is a comment, must be ignored",
		"00:00:00\tXEROX\tXEROX CORPORATION",
		"38:83:45\tAvmAudio\tFRITZ! Technology GmbH",
		"00:00:0F\tNEXTPUBL\t",   // trailing empty 3rd field -> falls back to short name
		"8C:A6:82:70/28\tAHSEET", // real manuf format for MA-M blocks: short (4-octet) address + only a short name
		"00:1A:2B/28\tShort\tSome Vendor With A Slash Prefix",
		"garbageline-not-enough-fields",
		"",
	}, "\n")

	out, lines, err := convertManuf([]byte(sample))
	got := string(out)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if lines != 4 {
		t.Fatalf("expected 4 converted lines, got %d:\n%s", lines, got)
	}

	if !strings.Contains(got, "000000\tXEROX CORPORATION\n") {
		t.Errorf("missing/incorrect XEROX line, got:\n%s", got)
	}

	if !strings.Contains(got, "388345\tFRITZ! Technology GmbH\n") {
		t.Errorf("missing/incorrect FRITZ! line (the exact bug being fixed), got:\n%s", got)
	}

	if !strings.Contains(got, "00000F\tNEXTPUBL\n") {
		t.Errorf("expected fallback to the short name when the long-name field is empty, got:\n%s", got)
	}

	// The real report that prompted this fallback: a MAC (8c:a6:82:71:54:9f) whose IEEE
	// MA-M registration only had a short name in the manuf file, so it was silently dropped
	// before this fix instead of showing up with at least the short vendor name.
	if !strings.Contains(got, "8CA6827\tAHSEET\n") {
		t.Errorf("expected fallback to the short name when there's no 3rd field at all, got:\n%s", got)
	}

	// 00:1A:2B/28 -> strip colons "001A2B", prefixlen 28 -> hexlen 7. "001A2B" is only 6 hex
	// chars (24 bits); a /28 prefix needs 7 hex chars (28 bits), which this address literally
	// doesn't have enough digits for - convertManuf must skip it rather than reading out of
	// bounds or emitting a truncated/garbage prefix.
	if strings.Contains(got, "Some Vendor With A Slash Prefix") {
		t.Errorf("expected the too-short /28 address to be skipped, got:\n%s", got)
	}
}

func TestConvertManufSlashPrefixWithinBounds(t *testing.T) {
	sample := "00:1A:2B:3C:00:00/28\tShort\tSome Vendor With A Slash Prefix\n"

	out, lines, err := convertManuf([]byte(sample))
	got := string(out)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if lines != 1 {
		t.Fatalf("expected 1 converted line, got %d:\n%s", lines, got)
	}

	// prefixlen 28 -> hexlen 7 -> first 7 hex chars of "001A2B3C0000"
	if !strings.Contains(got, "001A2B3\tSome Vendor With A Slash Prefix\n") {
		t.Errorf("unexpected conversion, got:\n%s", got)
	}
}

// TestConvertManufReportsScanErrors is a regression test for the actual bug behind a real
// report: a MAC (8c:a6:82:71:54:9f) resolved correctly right after a fresh download, but
// went back to "(Unknown)" after the next automatic refresh - with no error in the logs.
// bufio.Scanner silently stops (without an error!) once a single line exceeds its token
// limit, which used to leave convertManuf returning a shorter-but-still-"valid" (>minValidLines)
// file that got written out missing everything past the oversized line. This asserts the
// scan surfaces that failure as an error instead of a silent truncation.
func TestConvertManufReportsScanErrors(t *testing.T) {
	// One line far larger than bufio.Scanner's original 64KB default token size.
	oversized := strings.Repeat("A", 2*1024*1024)
	sample := "00:00:00\tXEROX\tXEROX CORPORATION\n" + oversized + "\n00:00:01\tFOO\tFOO CORP\n"

	_, _, err := convertManuf([]byte(sample))
	if err == nil {
		t.Fatalf("expected an error for a line exceeding the scanner buffer, got nil")
	}
}
