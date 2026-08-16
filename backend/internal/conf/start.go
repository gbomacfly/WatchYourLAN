package conf

import (
	"github.com/gbomacfly/WatchYourLAN/internal/check"
	"github.com/gbomacfly/WatchYourLAN/internal/models"
)

// AppConfig - app config
var AppConfig models.Conf

// Start - initial config
func Start(dirPath, nodePath string) {

	confPath := dirPath + "/config_v2.yaml"
	check.Path(confPath)

	AppConfig = read(confPath)

	AppConfig.DirPath = dirPath
	AppConfig.ConfPath = confPath
	AppConfig.DBPath = dirPath + "/scan.db"
	if nodePath != "" {
		AppConfig.NodePath = nodePath
	}
}
