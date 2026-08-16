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
		"00:00:0F\tNEXTPUBL\t", // no long name -> must be dropped
		"00:1A:2B/28\tShort\tSome Vendor With A Slash Prefix",
		"garbageline-not-enough-fields",
		"",
	}, "\n")

	out, lines := convertManuf([]byte(sample))
	got := string(out)

	if lines != 2 {
		t.Fatalf("expected 2 converted lines, got %d:\n%s", lines, got)
	}

	if !strings.Contains(got, "000000\tXEROX CORPORATION\n") {
		t.Errorf("missing/incorrect XEROX line, got:\n%s", got)
	}

	if !strings.Contains(got, "388345\tFRITZ! Technology GmbH\n") {
		t.Errorf("missing/incorrect FRITZ! line (the exact bug being fixed), got:\n%s", got)
	}

	if strings.Contains(got, "NEXTPUBL") {
		t.Errorf("line without a long vendor name should have been dropped, got:\n%s", got)
	}

	// 00:1A:2B/28 -> strip colons "001A2B", prefixlen 28 -> hexlen 7, "0"-padded? Actually
	// "001A2B" is only 6 hex chars (24 bits); a /28 prefix needs 7 hex chars (28 bits), which
	// this address literally doesn't have enough digits for - convertManuf must skip it
	// rather than reading out of bounds or emitting a truncated/garbage prefix.
	if strings.Contains(got, "Some Vendor With A Slash Prefix") {
		t.Errorf("expected the too-short /28 address to be skipped, got:\n%s", got)
	}
}

func TestConvertManufSlashPrefixWithinBounds(t *testing.T) {
	sample := "00:1A:2B:3C:00:00/28\tShort\tSome Vendor With A Slash Prefix\n"

	out, lines := convertManuf([]byte(sample))
	got := string(out)

	if lines != 1 {
		t.Fatalf("expected 1 converted line, got %d:\n%s", lines, got)
	}

	// prefixlen 28 -> hexlen 7 -> first 7 hex chars of "001A2B3C0000"
	if !strings.Contains(got, "001A2B3\tSome Vendor With A Slash Prefix\n") {
		t.Errorf("unexpected conversion, got:\n%s", got)
	}
}
