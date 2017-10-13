package authorization

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/guinso/goweb/util"
)

type addRole struct {
	Name string `json:"name"`
}

//HandleHTTPRequest handle incoming http request
//return true if request URL match and process
func HandleHTTPRequest(db *sql.DB, w http.ResponseWriter, r *http.Request, trimURL string) bool {
	if strings.HasPrefix(trimURL, "role") && util.IsPOST(r) {
		handleAddRole(db, w, r)
		return true
	} else if strings.HasPrefix(trimURL, "role") && util.IsGET(r) {
		handleGetRole(db, w, r)
		return true
	}

	return false
}

func handleAddRole(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	role := addRole{}

	if err := util.DecodeJSON(r, &role); err != nil {
		log.Printf("[role] failed to decode input parameter: %s", err.Error())
		util.SendHTTPErrorResponse(w)
		return
	}

	err := AddRole(db, role.Name)
	if err != nil {
		log.Printf("[role] encounter error when add role: %s", err.Error())
		util.SendHTTPErrorResponse(w)
		return
	}

	util.SendHTTPResponse(w, 0, "", "{}")
}

func handleGetRole(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	roles, err := GetRole(db, "", 10, 0)
	if err != nil {
		log.Printf("[role] Encounter error to get role record: %s", err.Error())
		util.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(roles)
	if jsonErr != nil {
		log.Printf("[role] Encounter error to encode roles record: %s", jsonErr.Error())
		util.SendHTTPErrorResponse(w)
		return
	}

	util.SendHTTPResponse(w, 0, "", string(jsonStr))
}
