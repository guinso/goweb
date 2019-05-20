package authorization

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/guinso/goweb/server"
)

type addRole struct {
	Name string `json:"name"`
}

type rowCount struct {
	Count int `json:"count"`
}

//HandleHTTPRequest handle incoming http request
//return true if request URL match and process
func HandleHTTPRequest(db *sql.DB, w http.ResponseWriter, r *http.Request, trimURL string) bool {
	if strings.Compare(trimURL, "role") == 0 && server.IsPOST(r) {
		handleAddRole(db, w, r)
		return true
	} else if strings.Compare(trimURL, "role") == 0 && server.IsGET(r) {
		handleGetRole(db, w, r)
		return true
	} else if strings.Compare(trimURL, "role-access") == 0 && server.IsGET(r) {
		handleGetAccessRole(db, w, r)
		return true
	} else if strings.Compare(trimURL, "role-access-count") == 0 && server.IsGET(r) {
		handleGetAccessRoleCount(db, w, r)
		return true
	} else if strings.Compare(trimURL, "access") == 0 && server.IsGET(r) {
		handleGetAccess(db, w, r)
		return true
	}

	return false
}

func handleAddRole(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	role := addRole{}

	if err := server.DecodeJSON(r, &role); err != nil {
		log.Printf("[role] failed to decode input parameter: %s", err.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	err := AddRole(db, role.Name)
	if err != nil {
		log.Printf("[role] encounter error when add role: %s", err.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	server.SendHTTPResponse(w, 0, "", "{}")
}

func handleGetRole(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	roles, err := GetRole(db, "", 10, 0)
	if err != nil {
		log.Printf("[role] Encounter error to get role record: %s", err.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(roles)
	if jsonErr != nil {
		log.Printf("[role] Encounter error to encode roles record: %s", jsonErr.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	server.SendHTTPResponse(w, 0, "", string(jsonStr))
}

func handleGetAccessRole(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	pgSize := 10
	pgIndex := 0
	accessID := ""
	roleID := ""

	query := r.URL.Query()
	if strings.Compare(query.Get("pgSize"), "") != 0 {
		if size, err := strconv.Atoi(query.Get("pgSize")); err == nil {
			pgSize = size
		}
	}
	if strings.Compare(query.Get("pgIndex"), "") != 0 {
		if index, err := strconv.Atoi(query.Get("pgIndex")); err == nil {
			pgIndex = index
		}
	}
	if strings.Compare(query.Get("accessID"), "") != 0 {
		accessID = query.Get("accessID")
	}
	if strings.Compare(query.Get("roleID"), "") != 0 {
		roleID = query.Get("roleID")
	}

	accessRole, err := GetAccessRole(db, "", accessID, roleID, pgSize, pgIndex)
	if err != nil {
		log.Printf("[access role] Encounter error to get access role record: %s", err.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(accessRole)
	if jsonErr != nil {
		log.Printf("[access role] Encounter error to encode access role record: %s", jsonErr.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	server.SendHTTPResponse(w, 0, "", string(jsonStr))
}

func handleGetAccessRoleCount(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	accessID := ""
	roleID := ""

	query := r.URL.Query()
	if strings.Compare(query.Get("accessID"), "") != 0 {
		accessID = query.Get("accessID")
	}
	if strings.Compare(query.Get("roleID"), "") != 0 {
		roleID = query.Get("roleID")
	}

	count, err := GetAccessRoleCount(db, "", accessID, roleID)
	if err != nil {
		log.Printf("[access role] Encounter error to get access role record: %s", err.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(rowCount{Count: count})
	if jsonErr != nil {
		log.Printf("[access role] Encounter error to encode access role record: %s", jsonErr.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	server.SendHTTPResponse(w, 0, "", string(jsonStr))
}

func handleGetAccess(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	pgSize := 10
	pgIndex := 0

	query := r.URL.Query()
	if strings.Compare(query.Get("pgSize"), "") != 0 {
		if size, err := strconv.Atoi(query.Get("pgSize")); err == nil {
			pgSize = size
		}
	}
	if strings.Compare(query.Get("pgIndex"), "") != 0 {
		if index, err := strconv.Atoi(query.Get("pgIndex")); err == nil {
			pgIndex = index
		}
	}

	access, err := GetAccess(db, "", pgSize, pgIndex)
	if err != nil {
		log.Printf("[access] Encounter error to get access record: %s", err.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(access)
	if jsonErr != nil {
		log.Printf("[access] Encounter error to encode access record: %s", jsonErr.Error())
		server.SendHTTPErrorResponse(w)
		return
	}

	server.SendHTTPResponse(w, 0, "", string(jsonStr))
}
