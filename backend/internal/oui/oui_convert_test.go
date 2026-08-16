package oui

import (
	"os"
	"strings"
	"testing"
)

// TestConvertManuf checks that convertManuf (the Go mirror kept only for fast unit
// coverage - Update() itself shells out to the real awkScript, not this) matches awk's
// actual, sometimes-surprising semantics: NF>=3 is a strict requirement (no short-name
// fallback), case is left as-is (no forced uppercase), and substr() clamps rather than
// erroring when asked for more hex digits than the address actually has.
func TestConvertManuf(t *testing.T) {
	sample := strings.Join([]string{
		"# This is a comment, must be ignored",
		"00:00:00\tXEROX\tXEROX CORPORATION",
		"38:83:45\tAvmAudio\tFRITZ! Technology GmbH",
		"00:00:0F\tNEXTPUBL\t",                                                     // empty 3rd field still counts as NF==3 in awk -> kept, empty vendor
		"8C:A6:82:70/28\tAnhuiseekere\tAnhui seeker electronic technology Co.,LTD", // real manuf line for the reported MAC
		"8C:A6:82:80/28\tSchok",                                                    // a genuine 2-field (no long name at all) line -> NF==2 -> dropped, matching awk
		"00:1A:2B/28\tShort\tSome Vendor With A Slash Prefix",                      // address shorter than the prefix needs -> clamped, not dropped
		"garbageline-not-enough-fields",
		"",
	}, "\n")

	out, lines, err := convertManuf([]byte(sample))
	got := string(out)

	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if lines != 5 {
		t.Fatalf("expected 5 converted lines, got %d:\n%s", lines, got)
	}

	if !strings.Contains(got, "000000\tXEROX CORPORATION\n") {
		t.Errorf("missing/incorrect XEROX line, got:\n%s", got)
	}

	if !strings.Contains(got, "388345\tFRITZ! Technology GmbH\n") {
		t.Errorf("missing/incorrect FRITZ! line (the exact bug being fixed), got:\n%s", got)
	}

	if !strings.Contains(got, "00000F\t\n") {
		t.Errorf("expected a kept line with an empty vendor (NF==3 with an empty 3rd field), got:\n%s", got)
	}

	// The actual real-world report: 8c:a6:82:71:54:9f showed "(Unknown)" instead of this.
	if !strings.Contains(got, "8CA6827\tAnhui seeker electronic technology Co.,LTD\n") {
		t.Errorf("missing/incorrect Anhui line (the real MA-M block from the bug report), got:\n%s", got)
	}

	if strings.Contains(got, "Schok") {
		t.Errorf("expected the 2-field (no long name at all) line to be dropped, matching awk's NF>=3, got:\n%s", got)
	}

	// 00:1A:2B/28 -> strip colons "001A2B" (6 hex chars, 24 bits). A /28 prefix asks for 7
	// hex chars (28 bits), which this address doesn't have - awk's substr(addr, 1, 7) on a
	// 6-char string just returns those 6 chars rather than erroring, so this must be kept
	// as "001A2B", not dropped.
	if !strings.Contains(got, "001A2B\tSome Vendor With A Slash Prefix\n") {
		t.Errorf("expected the too-short /28 address to be clamped (not dropped), got:\n%s", got)
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

func TestCountLines(t *testing.T) {
	dir := t.TempDir()

	cases := []struct {
		name    string
		content string
		want    int
	}{
		{"empty", "", 0},
		{"trailing newline", "a\nb\nc\n", 3},
		{"no trailing newline", "a\nb\nc", 3},
		{"single line no newline", "a", 1},
	}

	for _, c := range cases {
		path := dir + "/" + c.name
		if err := os.WriteFile(path, []byte(c.content), 0o644); err != nil {
			t.Fatalf("%s: setup failed: %v", c.name, err)
		}
		got, err := countLines(path)
		if err != nil {
			t.Fatalf("%s: unexpected error: %v", c.name, err)
		}
		if got != c.want {
			t.Errorf("%s: countLines() = %d, want %d", c.name, got, c.want)
		}
	}
}
