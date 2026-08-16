package routines

import (
	"time"

	"github.com/gbomacfly/WatchYourLAN/internal/oui"
)

// OuiUpdate - fetch the current arp-scan MAC vendor database once at startup, then
// keep it fresh on a weekly schedule. Runs in the background so a slow/unreachable
// network never delays startup or blocks scanning with the file that shipped in the image.
func OuiUpdate() {

	go func() {
		oui.Update()

		for {
			time.Sleep(time.Duration(7) * 24 * time.Hour) // Once a week

			oui.Update()
		}
	}()
}
