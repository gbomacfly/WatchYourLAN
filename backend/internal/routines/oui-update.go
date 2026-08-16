package routines

import (
	"time"

	"github.com/gbomacfly/WatchYourLAN/internal/oui"
)

// OuiUpdate - keep arp-scan's MAC vendor database fresh on a weekly schedule.
//
// The very first update is done synchronously by the caller (see main.go), before
// scanning starts - otherwise the first scan after every restart races the download and
// can end up reading the stale/baked-in ieee-oui.txt, writing outdated Hardware values
// into the DB (which then overwrite whatever was correctly resolved before the restart,
// since scan-routine.go refreshes Hw on every scan now). This function only handles the
// periodic refresh after that first, blocking call.
func OuiUpdate() {

	go func() {
		for {
			time.Sleep(time.Duration(7) * 24 * time.Hour) // Once a week

			oui.Update()
		}
	}()
}
