/**
This web server serve 2 different type request: [static file] and [dynamic path]
[Static file] URL path: /*
[Dynamic Path] URL path: /api/*
Preparation:
1) Create "static-files" directory to place all static file like index.html
2) Create "dynamic-files" diectory to place all dynamic or hidden logical files, example invoice.pdf
3) Place "index.html" at root of "static-files" directory
4) Place "neon.jpg" (any kind of JPEG file) at root of "dynamic-files" directory
Sample URL:
1) http://localhost:80/               - show static html file
2) http://localhost:80/api/meals      - demo GET Json request
3) http://localhost:80/api/img/12345  - demo dynamic image request
**/

package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/guinso/goweb/routing"
	"gopkg.in/ini.v1"
)

const (
	configFilename = "config.ini"
)

type configInfo struct {
	DbAddress  string //database address; e.g. localhost
	DbName     string //database name
	DbUsername string //database username
	DbPassword string //database password

	PortNumber int    //web server listen port number
	LogicDir   string //directory where store logical physical files; e.g. pay-slip.pdf
	StaticDir  string //directory where store direct access physical files; e.g. index.html
}

func main() {
	//read configuration file; create if not found
	config, configErr := initializeConfiguration()
	if configErr != nil {
		fmt.Printf("Failed to load configuration: %s", configErr.Error())
		return
	}

	//create basic files and directories if not found
	if err := initFilesAndDirs(config); err != nil {
		fmt.Printf("Failed to init files and directories: %s", err.Error())
		return
	}

	//TODO: check database connection

	//start web server
	fmt.Printf("Starting web server with port number %d \n", config.PortNumber)
	if webErr := startWebServer(config.PortNumber); webErr != nil {
		fmt.Printf("Failed to start web server: %s", webErr.Error())
		return
	}
}

func initFilesAndDirs(config *configInfo) error {
	exists, err := isDirectoryExists(config.LogicDir)
	if err != nil {
		fmt.Printf("Failed to check logical directory: %s", err.Error())
		return err
	}
	if !exists {
		if err = os.Mkdir(config.LogicDir, 0777); err != nil {
			fmt.Printf("Failed to create logical directory: %s", err.Error())
			return err
		}
	}

	exists, err = isDirectoryExists(config.StaticDir)
	if err != nil {
		fmt.Printf("Failed to check static directory: %s", err.Error())
		return err
	}
	if !exists {
		if err = os.Mkdir(config.StaticDir, 0777); err != nil {
			fmt.Printf("Failed to create static directory: %s", err.Error())
			return err
		}

		//TODO: create basic index.html file
		htmlContent :=
			`<html><body>
				<h1>This is auto generated home page</h1>
				<p>To customize content, plase go to ./` + config.StaticDir + `</p>
			</body></html>`
		if err = ioutil.WriteFile(config.StaticDir+"/index.html", []byte(htmlContent), 0777); err != nil {
			return err
		}
	}

	return nil
}

func startWebServer(port int) error {
	// handler all request start from "/"
	http.HandleFunc("/", routing.WebHandler)

	// start HTTP server in socket 7777
	return http.ListenAndServe(fmt.Sprintf(":%d", port), nil)

	// start HTTPS server (default socket 443)
	//x http.ListenAndServeTLS("/", "abc.crt", "abc.key", handler)
}

func initializeConfiguration() (*configInfo, error) {
	//check INI file exists or not; otherwise create one
	if !isFileExists(configFilename) {
		cfg := ini.Empty()
		sec, err := cfg.NewSection("database")
		if err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbserver", "localhost"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbname", ""); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbusername", "root"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbpassword", ""); err != nil {
			return nil, err
		}

		sec, err = cfg.NewSection("http")
		if _, err = sec.NewKey("portnumber", "80"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("staticdir", "static-files"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("logicaldir", "logical-files"); err != nil {
			return nil, err
		}

		//save to physical INI file
		if err = cfg.SaveTo(configFilename); err != nil {
			return nil, err
		}
	}

	return loadConfiguration(configFilename)
}

func loadConfiguration(filename string) (*configInfo, error) {
	cfg, err := ini.InsensitiveLoad(filename) //ignore capital letter key, all keys is small letter

	//save configuration to physical INI file before exit
	defer cfg.SaveTo(configFilename)

	if err != nil {
		return nil, err
	}

	config := configInfo{}

	dbSection, err := cfg.GetSection("database")
	if err != nil {
		return nil, err
	}
	if config.DbAddress, err = getConfigString(dbSection, "dbserver", "localhost"); err != nil {
		return nil, err
	}
	if config.DbName, err = getConfigString(dbSection, "dbname", "test"); err != nil {
		return nil, err
	}
	if config.DbUsername, err = getConfigString(dbSection, "dbusername", "root"); err != nil {
		return nil, err
	}
	if config.DbPassword, err = getConfigString(dbSection, "dbpassword", ""); err != nil {
		return nil, err
	}

	httpSection, err := cfg.GetSection("http")
	if err != nil {
		return nil, err
	}
	if config.PortNumber, err = getConfigInt(httpSection, "portnumber", "80"); err != nil {
		return nil, err
	}
	if config.LogicDir, err = getConfigString(httpSection, "logicaldir", "logical-files"); err != nil {
		return nil, err
	}
	if config.StaticDir, err = getConfigString(httpSection, "staticdir", "static-files"); err != nil {
		return nil, err
	}

	return &config, nil
}

func getConfigString(section *ini.Section, key string, defaultValue string) (string, error) {
	if section.Haskey(key) {
		return section.Key(key).String(), nil
	}

	section.NewKey(key, defaultValue)
	return defaultValue, nil
}

func getConfigInt(section *ini.Section, key string, defaultValue string) (int, error) {
	if section.Haskey(key) {
		return section.Key(key).Int()
	}

	section.NewKey(key, defaultValue)
	return strconv.Atoi(defaultValue)
}

func isFileExists(filename string) bool {
	if _, err := os.Stat(filename); err != nil {
		if os.IsNotExist(err) {
			return false //file not found
		}

		return false //stat command error
	}

	return true //file exists
}

func isDirectoryExists(directoryName string) (bool, error) {
	stat, err := os.Stat(directoryName)

	if err != nil {
		return false, nil //other errors
	}

	return stat.IsDir(), nil
}
