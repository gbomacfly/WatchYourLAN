package api

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/gbomacfly/WatchYourLAN/internal/check"
	"github.com/gbomacfly/WatchYourLAN/internal/gdb"
	"github.com/gbomacfly/WatchYourLAN/internal/models"
)

// getAllHosts godoc
// @Summary      Get all hosts
// @Description  Retrieve all hosts from the database
// @Tags         hosts
// @Produce      json
// @Success      200  {array}   models.Host
// @Router       /all [get]
func getAllHosts(c *gin.Context) {
	allHosts, _ := gdb.Select("now")
	c.IndentedJSON(http.StatusOK, allHosts)
}

// getHost godoc
// @Summary      Get host by ID
// @Description  Retrieve detailed information about a host by its unique ID
// @Tags         hosts
// @Produce      json
// @Param        id   path      string  true  "Host ID"
// @Success      200  {object}  models.Host
// @Router       /host/{id} [get]
func getHost(c *gin.Context) {
	idStr := c.Param("id")
	host := getHostByID(idStr) // functions.go
	_, host.DNS = check.DNS(host)
	c.IndentedJSON(http.StatusOK, host)
}

// delHost godoc
// @Summary      Delete host
// @Description  Remove a host from the database by its unique ID
// @Tags         hosts
// @Produce      json
// @Param        id   path      string  true  "Host ID"
// @Success      200  {string}  string  "OK"
// @Router       /host/del/{id} [get]
func delHost(c *gin.Context) {
	idStr := c.Param("id")
	host := getHostByID(idStr) // functions.go
	gdb.Delete("now", host.ID)
	slog.Info("Deleting from DB", "host", host)
	c.IndentedJSON(http.StatusOK, "OK")
}

// addHost godoc
// @Summary      Add host manually
// @Description  Add host by MAC, with optional Name, IP, Hardware
// @Description  Returns `models.Host` with this MAC form DB, either just added or existing
// @Tags         hosts
// @Produce      json
// @Param        mac   path      string  true   "Host MAC"
// @Param        name  query     string  false  "Name"
// @Param        ip    query     string  false  "IP"
// @Param        hw    query     string  false  "Hardware"
// @Success      200  {object}  models.Host
// @Router       /host/add/{mac} [get]
func addHost(c *gin.Context) {

	mac := c.Param("mac")
	hosts := gdb.SelectByMAC("now", mac)

	if len(hosts) > 0 {
		slog.Warn("Host with this MAC already exists", "host", hosts[0])
	} else {
		var host models.Host

		host.Mac = mac
		host.Name = c.Query("name")
		host.IP = c.Query("ip")
		host.Hw = c.Query("hw")

		gdb.Update("now", host)
		hosts = gdb.SelectByMAC("now", mac)

		slog.Info("Added host to DB", "host", hosts[0])
	}

	c.IndentedJSON(http.StatusOK, hosts[0])
}

// editHost godoc
// @Summary      Edit host
// @Description  Update a host's name and optionally toggle its "known" status
// @Tags         hosts
// @Produce      json
// @Param        id     path      string  true  "Host ID"
// @Param        name   path      string  true  "New name for the host"
// @Param        known  path      string  false "Pass 'toggle' to flip the known/unknown status"
// @Success      200    {string}  string  "OK"
// @Router       /edit/{id}/{name}/{known} [get]
func editHost(c *gin.Context) {

	idStr := c.Param("id")
	name := c.Param("name")
	toggleKnown := c.Param("known")

	host := getHostByID(idStr) // functions.go

	host.Name = name

	if toggleKnown == "/toggle" {
		host.Known = 1 - host.Known
	}

	gdb.Update("now", host)

	c.IndentedJSON(http.StatusOK, "OK")
}

// setHostTags godoc
// @Summary      Set host tags
// @Description  Replace a host's tags with a comma-separated list (e.g. "Network,IoT"). Pass an empty trailing segment (e.g. "/tags/5/") to clear all tags
// @Tags         hosts
// @Produce      json
// @Param        id    path      string  true  "Host ID"
// @Param        name  path      string  true  "Comma-separated tag list, empty to clear"
// @Success      200   {object}  models.Host
// @Router       /tags/{id}/{name} [get]
func setHostTags(c *gin.Context) {

	idStr := c.Param("id")
	tagsParam := strings.TrimPrefix(c.Param("name"), "/")

	host := getHostByID(idStr) // functions.go
	host.Tags = parseTags(tagsParam)

	gdb.Update("now", host)
	slog.Info("Set host tags", "host", host.Name, "tags", host.Tags)

	c.IndentedJSON(http.StatusOK, host)
}

// parseTags splits a comma-separated tag string into a trimmed, non-empty TagList
func parseTags(raw string) models.TagList {
	parts := strings.Split(raw, ",")
	tags := make(models.TagList, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			tags = append(tags, p)
		}
	}
	return tags
}

// getTags godoc
// @Summary      Get all tags
// @Description  Retrieve a sorted list of distinct, non-empty tags currently in use across all hosts
// @Tags         hosts
// @Produce      json
// @Success      200  {array}  string
// @Router       /tags [get]
func getTags(c *gin.Context) {
	tags := gdb.SelectTags()
	c.IndentedJSON(http.StatusOK, tags)
}
