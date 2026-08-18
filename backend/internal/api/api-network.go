package api

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/linde12/gowol"

	"github.com/gbomacfly/WatchYourLAN/internal/check"
	"github.com/gbomacfly/WatchYourLAN/internal/gdb"
	"github.com/gbomacfly/WatchYourLAN/internal/models"
	"github.com/gbomacfly/WatchYourLAN/internal/portscan"
)

// getPortState godoc
// @Summary      Check port state
// @Description  Check whether a given TCP port on an address is open or closed
// @Tags         network
// @Produce      json
// @Param        addr  path      string  true  "IP address or hostname"
// @Param        port  path      string  true  "Port number"
// @Success      200   {boolean}  bool   "true if open, false if closed"
// @Router       /port/{addr}/{port} [get]
func getPortState(c *gin.Context) {
	addr := c.Param("addr")
	port := c.Param("port")
	state := portscan.IsOpen(addr, port)
	c.IndentedJSON(http.StatusOK, state)
}

// getPortBanner godoc
// @Summary      Grab a port's greeting banner
// @Description  Best-effort: connects to an already-open TCP port and reads whatever greeting it offers (SSH/FTP/SMTP/...), or sends a minimal HTTP HEAD request otherwise. Empty string if nothing useful came back.
// @Tags         network
// @Produce      json
// @Param        addr  path      string  true  "IP address or hostname"
// @Param        port  path      string  true  "Port number"
// @Success      200   {string}  string  "banner text, possibly empty"
// @Router       /banner/{addr}/{port} [get]
func getPortBanner(c *gin.Context) {
	addr := c.Param("addr")
	port := c.Param("port")
	banner := portscan.GrabBanner(addr, port)
	c.IndentedJSON(http.StatusOK, banner)
}

// savePortScan godoc
// @Summary      Save port scan results
// @Description  Persist a host's port scan results (open ports + banners) so they can be shown again without re-scanning. The scan timestamp is set server-side to the time of saving.
// @Tags         network
// @Accept       json
// @Produce      json
// @Param        id    path      string                  true  "Host ID"
// @Param        ports body      []models.PortScanEntry  true  "Open ports found, with banners"
// @Success      200   {object}  models.Host
// @Router       /portscan/{id} [post]
func savePortScan(c *gin.Context) {

	idStr := c.Param("id")
	host := getHostByID(idStr) // functions.go

	var ports []models.PortScanEntry
	if err := c.ShouldBindJSON(&ports); check.IfError(err) {
		c.IndentedJSON(http.StatusBadRequest, "invalid port scan payload")
		return
	}

	host.PortScan = models.PortScanResult{
		ScannedAt: time.Now().Format("2006-01-02 15:04:05"),
		Ports:     ports,
	}

	gdb.Update("now", host)
	slog.Info("Saved port scan results", "host", host.Name, "ports", len(ports))

	c.IndentedJSON(http.StatusOK, host)
}

// sendWOL godoc
// @Summary      Send Wake-on-LAN packet
// @Description  Send a magic packet to wake up a host by its MAC address
// @Tags         network
// @Produce      json
// @Param        mac   path      string  true  "MAC address of the host"
// @Success      200   {boolean} bool    "true if sent successfully"
// @Router       /wol/{mac} [get]
func sendWOL(c *gin.Context) {

	mac := c.Param("mac")

	packet, err := gowol.NewMagicPacket(mac)

	if !check.IfError(err) {
		err = packet.Send("255.255.255.255")

		slog.Info("Wake-on-LAN: " + mac)
	}

	c.IndentedJSON(http.StatusOK, !check.IfError(err))
}
