package gdb

import (
	"sort"
	"strings"

	"github.com/gbomacfly/WatchYourLAN/internal/check"
	"github.com/gbomacfly/WatchYourLAN/internal/models"
)

// Select - get all hosts
func Select(table string) (dbHosts []models.Host, ok bool) {

	tab := db.Table(table)
	err := tab.Find(&dbHosts).Error

	return dbHosts, !check.IfError(err)
}

// SelectByID - get host by ID
func SelectByID(id int) (host models.Host) {

	tab := db.Table("now")
	tab.First(&host, id)

	return host
}

// SelectByMAC - get all hosts by MAC
func SelectByMAC(table, mac string) (hosts []models.Host) {

	tab := db.Table(table)
	tab.Where("\"MAC\" = ?", mac).Find(&hosts)

	return hosts
}

// SelectByDate - get all hosts by MAC and DATE
func SelectByDate(mac, date string) (hosts []models.Host) {

	tab := db.Table("history")
	tab.
		Where("\"MAC\" = ?", mac).
		Where("\"DATE\" LIKE ?", date+"%").
		Find(&hosts)

	return hosts
}

// SelectLatest - get latest hosts by MAC
func SelectLatest(mac string, number int) (hosts []models.Host) {

	tab := db.Table("history")
	tab.
		Where("\"MAC\" = ?", mac).
		Order("\"DATE\" DESC").
		Limit(number).
		Find(&hosts)

	return hosts
}

// SelectTags - get all distinct, non-empty tags in use across all hosts,
// sorted alphabetically. Each host's GROUPNAME column can hold several
// comma-separated tags, so this reads the raw values and splits them in Go
// rather than relying on SQL DISTINCT on the raw column.
func SelectTags() (tags []string) {

	var raw []string
	tab := db.Table("now")
	tab.
		Where("\"GROUPNAME\" <> ?", "").
		Pluck("GROUPNAME", &raw)

	seen := make(map[string]bool)
	for _, csv := range raw {
		for _, tag := range strings.Split(csv, ",") {
			tag = strings.TrimSpace(tag)
			if tag != "" && !seen[tag] {
				seen[tag] = true
				tags = append(tags, tag)
			}
		}
	}
	sort.Strings(tags)

	return tags
}
