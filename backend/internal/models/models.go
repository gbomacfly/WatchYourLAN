package models

import (
	"database/sql/driver"
	"encoding/json"
	"strings"
)

// TagList is a set of free-form tags on a host. It is stored in the DB as a
// single comma-separated TEXT column (the same GROUPNAME column previously
// used for a single group name, so no migration is needed - an existing
// single group value just becomes a one-element tag list), but marshals
// to/from JSON as a proper string array.
type TagList []string

// Value implements driver.Valuer, encoding the tag list as "tag1,tag2".
func (t TagList) Value() (driver.Value, error) {
	return strings.Join(t, ","), nil
}

// Scan implements sql.Scanner, decoding "tag1,tag2" back into a TagList,
// trimming whitespace and dropping empty entries.
func (t *TagList) Scan(value any) error {
	var raw string
	switch v := value.(type) {
	case string:
		raw = v
	case []byte:
		raw = string(v)
	default:
		*t = TagList{}
		return nil
	}

	if raw == "" {
		*t = TagList{}
		return nil
	}

	parts := strings.Split(raw, ",")
	out := make(TagList, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	*t = out
	return nil
}

// PortScanEntry is a single open port found by a port scan, with whatever
// greeting/banner text (if any) was grabbed from it.
type PortScanEntry struct {
	Port   int
	Banner string
}

// PortScanResult is a host's most recent port scan: when it ran and what it
// found. It is stored in the DB as a single JSON TEXT column, so a host can
// show its last scan results (with an "as of" timestamp) without re-scanning
// every time its detail page is opened.
type PortScanResult struct {
	ScannedAt string // empty if the host was never scanned
	Ports     []PortScanEntry
}

// Value implements driver.Valuer, encoding the result as JSON. A never-scanned
// host (the zero value) is stored as an empty string rather than "null"/"{}",
// so it round-trips cleanly through Scan below.
func (p PortScanResult) Value() (driver.Value, error) {
	if p.ScannedAt == "" && len(p.Ports) == 0 {
		return "", nil
	}
	b, err := json.Marshal(p)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

// Scan implements sql.Scanner, decoding the stored JSON back into a
// PortScanResult. Malformed or empty data just yields the zero value
// (never scanned) rather than failing the whole host load.
func (p *PortScanResult) Scan(value any) error {
	var raw string
	switch v := value.(type) {
	case string:
		raw = v
	case []byte:
		raw = string(v)
	default:
		*p = PortScanResult{}
		return nil
	}

	if raw == "" {
		*p = PortScanResult{}
		return nil
	}

	var out PortScanResult
	if err := json.Unmarshal([]byte(raw), &out); err != nil {
		*p = PortScanResult{}
		return nil
	}
	*p = out
	return nil
}

// Conf - app config
type Conf struct {
	Host     string
	Port     string
	Theme    string
	Color    string
	DirPath  string
	ConfPath string
	DBPath   string
	NodePath string
	LogLevel string
	Ifaces   string
	ArpArgs  string
	ArpStrs  []string
	Timeout  int
	TrimHist int
	ShoutURL string
	Version  string
	// PostgreSQL
	UseDB     string
	PGConnect string
	// InfluxDB
	InfluxEnable  bool
	InfluxAddr    string
	InfluxToken   string
	InfluxOrg     string
	InfluxBucket  string
	InfluxSkipTLS bool
	// Prometheus
	PrometheusEnable bool
}

// Host - one host
type Host struct {
	ID    int     `gorm:"column:ID;primaryKey"`
	Name  string  `gorm:"column:NAME"`
	DNS   string  `gorm:"column:DNS"`
	Iface string  `gorm:"column:IFACE"`
	IP    string  `gorm:"column:IP"`
	Mac   string  `gorm:"column:MAC"`
	Hw    string  `gorm:"column:HW"`
	Date  string  `gorm:"column:DATE"`
	Known int     `gorm:"column:KNOWN"`
	Now   int     `gorm:"column:NOW"`
	Tags  TagList `gorm:"column:GROUPNAME"`

	PortScan PortScanResult `gorm:"column:PORTSCAN"`
}

// Stat - status
type Stat struct {
	Total   int
	Online  int
	Offline int
	Known   int
	Unknown int
}
