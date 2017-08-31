package routing

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

// WebHandler HTTP request to either static file server or REST server (URL start with "api/")
func WebHandler(w http.ResponseWriter, r *http.Request) {
	//remove first "/" character
	urlPath := r.URL.Path[1:]

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
		log.Print("Entering static file handler: " + urlPath)

		// define your static file directory
		staticFilePath := "./static-files/"

		//other wise, let read a file path and display to client
		http.ServeFile(w, r, staticFilePath+urlPath)
	}
}

//handle dynamic HTTP user requset
func routePath(w http.ResponseWriter, r *http.Request, trimURL string) {
	// find and match trimmed URL to respective REST request
	//      trimmed URL
	//      request method
	//      input parameter(s)

	if strings.HasPrefix(trimURL, "login") {
		// example URL: localhost:7777/api/login
		// TODO: handle login request
		fmt.Fprint(w, "Request login")
	} else if strings.HasPrefix(trimURL, "logout") {
		// example URL: localhost:7777/api/logout
		// TODO: handle logout request
		fmt.Fprint(w, "Request logout")
	} else if strings.HasPrefix(trimURL, "meals") {
		// example URL: localhost:7777/api/meals
		// show list of meals
		w.Header().Set("Content-Type", "application/json") //MIME to application/json
		w.WriteHeader(http.StatusOK)                       //status code 200, OK
		w.Write([]byte("{ msg: \"this is meal A \" }"))    //body text
	} else if strings.HasPrefix(trimURL, "img/") {
		// example URL: localhost:7777/api/img/
		// show image file to client dynamically

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
