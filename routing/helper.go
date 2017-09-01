package routing

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/guinso/stringtool"
)

var dbb *sql.DB

//GetTestDB get database handler for unit test
func GetTestDB() *sql.DB {
	if dbb == nil {
		dbb, _ = sql.Open("mysql", fmt.Sprintf(
			"%s:%s@tcp(%s:%d)/%s?charset=utf8",
			"root",
			"",
			"localhost",
			3306,
			"test"))
	}

	return dbb
}

func DecodeJSON(request *http.Request, obj interface{}) error {
	decoder := json.NewDecoder(request.Body)

	if err := decoder.Decode(&obj); err != nil {
		return err
	}

	return nil
}

//GetRandomRunningNumber get next random generated MD5 value to fill
func GetRandomRunningNumber(tableName string) string {

	return stringtool.MakeMD5(
		tableName +
			strconv.FormatInt(time.Now().UnixNano(), 10) +
			strconv.FormatInt(rand.Int63(), 10))
}

//SendHTTPResponse send HTTP response
func SendHTTPResponse(w http.ResponseWriter, statusCode int, statusMsg string, json string) {
	w.WriteHeader(200)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(fmt.Sprintf(
		"{statusCode:%d, statusMsg:\"%s\", response:%s}",
		statusCode, statusMsg, json)))
}

//SendHTTPErrorResponse send HTTP 500 internal error response
func SendHTTPErrorResponse(w http.ResponseWriter) {
	w.WriteHeader(500)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte("{msg:\"Encounter internal server error\"}"))
}
