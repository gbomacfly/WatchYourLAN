#!/usr/bin/env python3
"""
Mirrors backend/internal/oui/oui.go's convertManuf() line for line, so we can diff its
output against the working awk script's output on the exact same raw manuf input and find
where the two implementations actually diverge - instead of guessing.

Usage: python3 convert_manuf_like_go.py /tmp/manuf_fresh > /tmp/ieee-oui-go.txt
"""
import sys

def convert(path):
    out_lines = []
    with open(path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.rstrip("\n").rstrip("\r")

            if line.startswith("#"):
                continue

            fields = line.split("\t")
            if len(fields) < 2:
                continue

            addr = fields[0]
            prefix_len = 24

            if "/" in addr:
                idx = addr.index("/")
                suffix = addr[idx + 1:]
                try:
                    prefix_len = int(suffix)
                except ValueError:
                    continue
                addr = addr[:idx]

            addr = addr.replace(":", "").upper()

            hex_len = prefix_len // 4
            if hex_len <= 0 or hex_len > len(addr):
                continue

            vendor = ""
            if len(fields) >= 3:
                vendor = fields[2].strip()
            if vendor == "":
                vendor = fields[1].strip()
            if vendor == "":
                continue

            out_lines.append(addr[:hex_len] + "\t" + vendor)

    return out_lines


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: convert_manuf_like_go.py <raw-manuf-file>", file=sys.stderr)
        sys.exit(1)

    for l in convert(sys.argv[1]):
        print(l)
