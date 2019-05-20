package server

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/guinso/stringtool"
)

//WebServerSimple simple web server with configuration
type WebServerSimple struct {
	//dbb          *sql.DB
	productionDB *sql.DB

	configuration *ConfigurationService
}

//SetDB set and hold production database handler
// func (server *WebServerSimple) SetDB(db *sql.DB) {
// 	server.productionDB = db
// }

//GetDB get production database handler
func (server *WebServerSimple) GetDB() *sql.DB {
	return server.productionDB
}

//DecodeJSON marshal http request body stream to object
func (server *WebServerSimple) DecodeJSON(request *http.Request, obj interface{}) error {
	decoder := json.NewDecoder(request.Body)

	if err := decoder.Decode(&obj); err != nil {
		return err
	}

	return nil
}

//GetRandomRunningNumber get next random generated MD5 value to fill
func (server *WebServerSimple) GetRandomRunningNumber(tableName string) string {

	return stringtool.MakeMD5(
		tableName +
			strconv.FormatInt(time.Now().UnixNano(), 10) +
			strconv.FormatInt(rand.Int63(), 10))
}

//SendHTTPResponse send HTTP response
func (server *WebServerSimple) SendHTTPResponse(w http.ResponseWriter, statusCode int, statusMsg string, json string) {
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(
		"{\"statusCode\":%d, \"statusMsg\":\"%s\", \"response\":%s}",
		statusCode, statusMsg, json)))
}

//SendHTTPErrorResponse send HTTP 500 internal error response
func (server *WebServerSimple) SendHTTPErrorResponse(w http.ResponseWriter) {
	w.WriteHeader(500)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{msg:\"Encounter internal server error\"}"))
}

//IsPOST check request HTTP is POST method
func (server *WebServerSimple) IsPOST(r *http.Request) bool {
	return strings.Compare(strings.ToLower(r.Method), "post") == 0
}

//IsGET check request HTTP is GET method
func (server *WebServerSimple) IsGET(r *http.Request) bool {
	return strings.Compare(strings.ToLower(r.Method), "get") == 0
}

//IsPUT check request HTTP is PUT method
func (server *WebServerSimple) IsPUT(r *http.Request) bool {
	return strings.Compare(strings.ToLower(r.Method), "put") == 0
}

//IsDELETE check request HTTP is DELETE method
func (server *WebServerSimple) IsDELETE(r *http.Request) bool {
	return strings.Compare(strings.ToLower(r.Method), "delete") == 0
}

// FileExists reports whether the named file or directory exists.
func (server *WebServerSimple) FileExists(name string) bool {
	if _, err := os.Stat(name); err != nil {
		if os.IsNotExist(err) {
			return false
		}
	}
	return true
}
