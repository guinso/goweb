package server

import (
	"database/sql"
	"net/http"
)

//WebServer webserver service interface
type WebServer interface {
	GetDB() *sql.DB

	DecodeJSON(request *http.Request, obj interface{}) error

	GetRandomRunningNumber(tableName string) string

	SendHTTPResponse(w http.ResponseWriter, statusCode int, statusMsg string, json string)
	SendHTTPErrorResponse(w http.ResponseWriter)

	IsPOST(r *http.Request) bool
	IsGET(r *http.Request) bool
	IsPUT(r *http.Request) bool
	IsDELETE(r *http.Request) bool

	FileExists(name string) bool
}
