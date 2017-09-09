package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/util"
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

	/***********************************************/
	//TODO: add your custom web API here:
	/**********************************************/

	//handle authentication web API
	//1. /login
	//2. /logout
	if authentication.HandleHTTPRequest(util.GetDB(), w, r, trimURL) {
		return
	}

	//TODO: handle authorization web API

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