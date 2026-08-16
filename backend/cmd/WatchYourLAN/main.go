// @title WatchYourLAN API
// @version 0.1
// @description Lightweight network IP scanner written in Go
// @contact.url   https://github.com/gbomacfly/WatchYourLAN
// @license.name  MIT
// @license.url   https://opensource.org/licenses/MIT
// @BasePath /api/

package main

import (
	"flag"
	// "net/http"

	// _ "net/http/pprof"

	// Import Swagger docs
	_ "github.com/gbomacfly/WatchYourLAN/docs"

	"github.com/gbomacfly/WatchYourLAN/internal/conf"
	"github.com/gbomacfly/WatchYourLAN/internal/gdb"
	"github.com/gbomacfly/WatchYourLAN/internal/routines"
	"github.com/gbomacfly/WatchYourLAN/internal/web"
)

const dirPath = "/data/WatchYourLAN"
const nodePath = ""

func main() {
	dirPtr := flag.String("d", dirPath, "Path to config dir")
	nodePtr := flag.String("n", nodePath, "Path to node modules")
	flag.Parse()

	// pprof - memory leak detect
	// go tool pprof -alloc_space http://localhost:8085/debug/pprof/heap
	// (pprof) web
	// (pprof) list db.Select
	//
	// go func() {
	// 	http.ListenAndServe("localhost:8085", nil)
	// }()

	// Make AppConfig
	conf.Start(*dirPtr, *nodePtr)

	gdb.Start()

	routines.ScanRestart()
	routines.HistoryTrim()
	routines.OuiUpdate()

	web.Gui()
}
