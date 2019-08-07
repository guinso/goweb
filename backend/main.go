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
	"path"
	"strings"

	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/authorization"
	"github.com/guinso/goweb/server"

	_ "github.com/mattn/go-sqlite3"
)

var webServer *server.WebSimple
var authenticateHandler *authentication.HTTPRequestHandler
var authorizeHandler *authorization.HTTPRequestHandler
var config *server.ConfigInfo

func main() {
	log.Println("Starting GO web")

	log.Print("Loading configuration...")
	//read configuration file; create if not found

	configService := &server.ConfigurationINI{}
	webServer = &server.WebSimple{
		Configuration: configService}

	var configErr error
	config, configErr = configService.LoadConfiguration("./config.ini")
	if configErr != nil {
		log.Println("[failed]")
		log.Printf("Failed to load configuration: %s", configErr.Error())
		return
	}
	log.Print("[done]")

	//create basic files and directories if not found
	log.Print("Checking directory configuration...")
	if err := initFilesAndDirs(config); err != nil {
		log.Printf("Failed to init files and directories: %s", err.Error())
		return
	}
	log.Print("[done]")

	log.Print("Try connect to SQLITE database...")
	//check database connection
	db, err := checkSQLITEConnection(config)
	if err != nil {
		log.Print("[failed]")
		log.Printf(": %s\r\n", err.Error())
		return
	}
	log.Println("[done]")

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

	log.Print("Preparing modules...")
	webServer.DB = db
	authenticateHandler = authentication.NewHTTPRequestHandler(webServer, db, "gorilla-web")
	authorizeHandler = authorization.NewHTTPRequestHandler(webServer, db)
	log.Println("[done]")

	//start web server
	if webErr := startWebServer(config); webErr != nil {
		log.Printf("Failed to start web server: %s\r\n", webErr.Error())
		return
	}
}

func startWebServer(config *server.ConfigInfo) error {
	// handler all request start from "/"
	http.HandleFunc("/", WebHandler)

	if strings.Compare(config.SSLKey, "") != 0 && strings.Compare(config.SSLCert, "") != 0 {
		log.Printf("start web server in HTTPS protocol, port %d\r\n", config.PortNumber)
		return http.ListenAndServeTLS(fmt.Sprintf(":%d", config.PortNumber),
			config.SSLCert, config.SSLKey, nil)
	}

	log.Printf("start web server in HTTP protocol, port %d\r\n", config.PortNumber)
	return http.ListenAndServe(fmt.Sprintf(":%d", config.PortNumber), nil)

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
	logicalDir := path.Clean(config.LogicDir)
	staticDir := path.Clean(config.StaticDir)

	exists, err := webServer.DirectoryExists(logicalDir)
	if err != nil {
		fmt.Printf("Failed to check logical directory: %s", err.Error())
		return err
	}
	if !exists {
		if err = os.Mkdir(logicalDir, 0777); err != nil {
			fmt.Printf("Failed to create logical directory: %s", err.Error())
			return err
		}
	}

	exists, err = webServer.DirectoryExists(staticDir)
	if err != nil {
		fmt.Printf("Failed to check static directory: %s", err.Error())
		return err
	}
	if !exists {
		if err = os.Mkdir(staticDir, 0777); err != nil {
			fmt.Printf("Failed to create static directory: %s", err.Error())
			return err
		}

		//create basic index.html file
		htmlContent :=
			`<html><body>
				<h1>This is auto generated home page</h1>
				<p>To customize content, plase go to ./` + staticDir + `</p>
			</body></html>`
		if err = ioutil.WriteFile(staticDir+"/index.html", []byte(htmlContent), 0777); err != nil {
			return err
		}
	}

	return nil
}

// WebHandler HTTP request to either static file server or REST server (URL start with "api/")
func WebHandler(w http.ResponseWriter, r *http.Request) {

	var urlPath = r.URL.Path
	if strings.HasPrefix(urlPath, "/") {
		//remove first "/" character
		urlPath = r.URL.Path[1:]
	}

	//if start with "api/" direct to REST handler
	if strings.HasPrefix(urlPath, "api/") {
		log.Println("Serving API URL: " + r.URL.Path)

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

		physicalFilePath := fmt.Sprintf("./%s/%s", config.StaticDir, urlPath)

		//read a file path and display to client
		http.ServeFile(w, r, physicalFilePath)
	}
}

//handle dynamic HTTP user requset
func routePath(w http.ResponseWriter, r *http.Request, trimURL string) {

	/***********************************************/
	//TODO: add your custom web API here:
	/**********************************************/

	if strings.HasPrefix(trimURL, "login") && webServer.IsPOST(r) { //>>>>authentication
		authenticateHandler.HandleHTTPLogin(w, r)
	} else if strings.HasPrefix(trimURL, "logout") && webServer.IsPOST(r) {
		authenticateHandler.HandleHTTPLogout(w, r)
	} else if strings.Compare(trimURL, "current-user") == 0 && webServer.IsGET(r) {
		authenticateHandler.HandleCurrentUser(w, r)
	} else if strings.Compare(trimURL, "role") == 0 && webServer.IsPOST(r) { //>>>>authorization
		authorizeHandler.HandleAddRole(w, r)
	} else if strings.Compare(trimURL, "role") == 0 && webServer.IsGET(r) {
		authorizeHandler.HandleGetRole(w, r)
	} else if strings.Compare(trimURL, "role-access") == 0 && webServer.IsGET(r) {
		authorizeHandler.HandleGetAccessRole(w, r)
	} else if strings.Compare(trimURL, "role-access-count") == 0 && webServer.IsGET(r) {
		authorizeHandler.HandleGetAccessRoleCount(w, r)
	} else if strings.Compare(trimURL, "access") == 0 && webServer.IsGET(r) {
		authorizeHandler.HandleGetAccess(w, r)
	} else if strings.HasPrefix(trimURL, "meals") { //>>>>sample return JSON
		w.Header().Set("Content-Type", "application/json")  //MIME to application/json
		w.WriteHeader(http.StatusOK)                        //status code 200, OK
		w.Write([]byte("{ \"msg\": \"this is meal A \" }")) //body text
		return
	} else if strings.HasPrefix(trimURL, "img/") { //>>>>sample return virtual JPG file to client
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
	} else {
		// show error code 404 not found
		//(since the requested URL doesn't match any of it)
		handleErrorCode(404, "Path not found.", w)
	}

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
