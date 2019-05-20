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
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/guinso/goweb/server"

	//explicitly include GO mysql library
	//_ "github.com/go-sql-driver/mysql"

	//x _ "gopkg.in/go-sql-driver/mysql.v1"
	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/authorization"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	log.Println("Starting GO web")

	log.Print("Loading configuration...")
	//read configuration file; create if not found

	configService := server.ConfigurationINI{}
	config, configErr := configService.LoadConfiguration("./config.ini")
	if configErr != nil {
		fmt.Println("[failed]")
		fmt.Printf("Failed to load configuration: %s", configErr.Error())
		return
	}
	fmt.Println("[done]")

	//create basic files and directories if not found
	if err := initFilesAndDirs(config); err != nil {
		fmt.Printf("Failed to init files and directories: %s", err.Error())
		return
	}

	log.Print("Try connect to SQLITE database...")
	//check database connection
	db, err := checkSQLITEConnection(config)
	if err != nil {
		fmt.Println("[failed]")
		fmt.Printf("Failed to check database connection: %s", err.Error())
		return
	}
	fmt.Println("[done]")

	//initialize database if requested
	/*
		if config.DbInitTable {
			log.Print("Initialize data table...")
			if err := initDbTable(db, config.DbName); err != nil {
				fmt.Println("[failed]")
				fmt.Printf("Failed to initialize database table: %s", err.Error())
				return
			}
			fmt.Println("[done]")
		}
	*/

	server.SetDB(db)

	//start web server
	fmt.Printf("Starting web server with port number %d \n", config.PortNumber)
	if webErr := startWebServer(config.PortNumber); webErr != nil {
		fmt.Printf("Failed to start web server: %s", webErr.Error())
		return
	}
}

func startWebServer(port int) error {
	// handler all request start from "/"
	http.HandleFunc("/", WebHandler)

	// start HTTP server in socket 7777
	return http.ListenAndServe(fmt.Sprintf(":%d", port), nil)

	// start HTTPS server (default socket 443)
	//x http.ListenAndServeTLS("/", "abc.crt", "abc.key", handler)
}

func checkMySQLDbConnection(config *server.ConfigInfo) (*sql.DB, error) {
	//TODO:  handle various database vendor
	dbx, err := sql.Open("mysql", fmt.Sprintf(
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
	if pingErr := dbx.Ping(); pingErr != nil {
		return nil, pingErr
	}

	return dbx, nil
}

func checkSQLITEConnection(config *server.ConfigInfo) (*sql.DB, error) {
	dbx, err := sql.Open("sqlite3", config.DbAddress)

	if err != nil {
		return nil, err
	}

	return dbx, nil
}

func initFilesAndDirs(config *server.ConfigInfo) error {
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

// WebHandler HTTP request to either static file server or REST server (URL start with "api/")
func WebHandler(w http.ResponseWriter, r *http.Request) {

	var urlPath = r.URL.Path
	if strings.HasPrefix(urlPath, "/") {
		//remove first "/" character
		urlPath = r.URL.Path[1:]
	}

	log.Println("Serving API URL: " + r.URL.Path)

	//if start with "api/" direct to REST handler
	if strings.HasPrefix(urlPath, "api/") {
		//trim prefix "api/"
		trimmedURL := urlPath[4:]
		/*
			//trim suffix "/"
			if strings.HasSuffix(trimmedURL, "/") {
				trimmedURL = trimmedURL[0:(len(trimmedURL) - 1)]
			}
		*/

		routePath(w, r, trimmedURL)
	} else {
		log.Println("Serving static file URL: " + r.URL.Path)

		// define your static file directory
		staticFilePath := "./static-files/"

		//other wise, let read a file path and display to client
		http.ServeFile(w, r, staticFilePath+urlPath)
	}
}

//handle dynamic HTTP user requset
func routePath(w http.ResponseWriter, r *http.Request, trimURL string) {

	/***********************************************/
	//TODO: add your custom web API here:
	/**********************************************/

	//handle authentication web API
	//1. /login (POST)
	//2. /logout (POST)
	if authentication.HandleHTTPRequest(server.GetDB(), w, r, trimURL) {
		return
	}

	//TODO: handle authorization web API
	//1. /role (GET + POST)
	if authorization.HandleHTTPRequest(server.GetDB(), w, r, trimURL) {
		return
	}

	//sample return JSON
	if strings.HasPrefix(trimURL, "meals") {
		w.Header().Set("Content-Type", "application/json")  //MIME to application/json
		w.WriteHeader(http.StatusOK)                        //status code 200, OK
		w.Write([]byte("{ \"msg\": \"this is meal A \" }")) //body text
		return
	}

	//sample return virtual JPG file to client
	if strings.HasPrefix(trimURL, "img/") {
		logicalFilePath := "./logic-files/"
		physicalFileName := "neon.jpg"

		// try read file
		data, err := ioutil.ReadFile(logicalFilePath + physicalFileName)
		if err != nil {
			// show error page if failed to read file
			handleErrorCode(500, "Unable to retrieve image file", w)
		} else {
			//w.Header().Set("Content-Type", "image/jpg") // #optional HTTP header info

			// uncomment if image file is meant to download instead of display on web browser
			// clientDisplayFileName = "customName.jpg"
			//w.header().Set("Content-Disposition", "attachment; filename=\"" + clientDisplayFileName + "\"")

			// write file (in binary format) direct into HTTP return content
			w.Write(data)
		}
	}

	// show error code 404 not found
	//(since the requested URL doesn't match any of it)
	handleErrorCode(404, "Path not found.", w)
}

// Generate error page
func handleErrorCode(errorCode int, description string, w http.ResponseWriter) {
	w.WriteHeader(errorCode)                    // set HTTP status code (example 404, 500)
	w.Header().Set("Content-Type", "text/html") // clarify return type (MIME)
	w.Write([]byte(fmt.Sprintf(
		"<html><body><h1>Error %d</h1><p>%s</p></body></html>",
		errorCode,
		description)))
}
