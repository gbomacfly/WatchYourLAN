package api

import (
	"strconv"

	"github.com/gbomacfly/WatchYourLAN/internal/gdb"
	"github.com/gbomacfly/WatchYourLAN/internal/models"
)

func getHostByID(idStr string) (oneHost models.Host) {

	id, _ := strconv.Atoi(idStr)
	oneHost = gdb.SelectByID(id)

	return oneHost
}
