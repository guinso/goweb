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
	"database/sql"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/guinso/goweb/routing"
	//explicitly include GO mysql library
	_ "github.com/go-sql-driver/mysql"
)

const (
	configFilename = "config.ini"
)

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

	//check database connection
	db, err := checkDbConnection(config)
	if err != nil {
		fmt.Printf("Failed to check database connection: %s", err.Error())
		return
	}

	//initialize database if requested
	if config.DbInitTable {
		if err := initDbTable(db, config.DbName); err != nil {
			fmt.Printf("Failed to initialize database table: %s", err.Error())
			return
		}
	}

	//start web server
	fmt.Printf("Starting web server with port number %d \n", config.PortNumber)
	if webErr := startWebServer(config.PortNumber); webErr != nil {
		fmt.Printf("Failed to start web server: %s", webErr.Error())
		return
	}
}

func startWebServer(port int) error {
	// handler all request start from "/"
	http.HandleFunc("/", routing.WebHandler)

	// start HTTP server in socket 7777
	return http.ListenAndServe(fmt.Sprintf(":%d", port), nil)

	// start HTTPS server (default socket 443)
	//x http.ListenAndServeTLS("/", "abc.crt", "abc.key", handler)
}

func checkDbConnection(config *configInfo) (*sql.DB, error) {
	//TODO:  handle various database vendor
	db, err := sql.Open("mysql", fmt.Sprintf(
		"%s:%s@tcp(%s:%d)/%s?charset=utf8",
		config.DbUsername,
		config.DbPassword,
		config.DbAddress,
		config.DbPort,
		config.DbName))

	if err != nil {
		return nil, err
	}

	//check connection is valid or not
	if pingErr := db.Ping(); pingErr != nil {
		return nil, pingErr
	}

	return db, nil
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

		//create basic index.html file
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
