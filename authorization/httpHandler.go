package authorization

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/server"
	"github.com/guinso/rdbmstool"
)

type addRole struct {
	Name string `json:"name"`
}

type rowCount struct {
	Count int `json:"count"`
}

//HTTPRequestHandler HTTP request handler for authorization
type HTTPRequestHandler struct {
	DB         *sql.DB
	Server     server.WebServer
	dbProxy    rdbmstool.DbHandlerProxy
	Role       *authentication.RoleSQLite
	Access     *AccessSQLite
	RoleAccess *RoleAccessSQLite
}

//NewHTTPRequestHandler instantiate a new HTTP request handler
func NewHTTPRequestHandler(serverParam server.WebServer, DBparam *sql.DB) *HTTPRequestHandler {
	handler := &HTTPRequestHandler{
		DB:      DBparam,
		Server:  serverParam,
		dbProxy: DBparam}

	handler.Role = authentication.NewRoleSQLite(serverParam, handler.getDBProxy)
	handler.Access = NewAccessSQLite(serverParam, handler.getDBProxy)
	handler.RoleAccess = NewRoleAccessSQLite(serverParam, handler.getDBProxy)

	return handler
}

//GetDBProxy get database proxy
func (handler *HTTPRequestHandler) getDBProxy() rdbmstool.DbHandlerProxy {
	return handler.dbProxy
}

//HandleHTTPRequest handle incoming http request
//return true if request URL match and process
func (handler *HTTPRequestHandler) HandleHTTPRequest(w http.ResponseWriter, r *http.Request, trimURL string) bool {
	if strings.Compare(trimURL, "role") == 0 && handler.Server.IsPOST(r) {
		handler.HandleAddRole(w, r)
		return true
	} else if strings.Compare(trimURL, "role") == 0 && handler.Server.IsGET(r) {
		handler.HandleGetRole(w, r)
		return true
	} else if strings.Compare(trimURL, "role-access") == 0 && handler.Server.IsGET(r) {
		handler.HandleGetAccessRole(w, r)
		return true
	} else if strings.Compare(trimURL, "role-access-count") == 0 && handler.Server.IsGET(r) {
		handler.HandleGetAccessRoleCount(w, r)
		return true
	} else if strings.Compare(trimURL, "access") == 0 && handler.Server.IsGET(r) {
		handler.HandleGetAccess(w, r)
		return true
	}

	return false
}

//HandleAddRole add a new role
func (handler *HTTPRequestHandler) HandleAddRole(w http.ResponseWriter, r *http.Request) {
	role := addRole{}

	if err := handler.Server.DecodeJSON(r, &role); err != nil {
		log.Printf("[role] failed to decode input parameter: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	err := handler.Role.AddRole(role.Name)
	if err != nil {
		log.Printf("[role] encounter error when add role: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	handler.Server.SendHTTPResponse(w, 0, "", "{}")
}

//HandleGetRole get Role records
func (handler *HTTPRequestHandler) HandleGetRole(w http.ResponseWriter, r *http.Request) {
	roles, err := handler.Role.GetRole(&authentication.RoleSearchParam{Keyword: "", PageSize: 10, PageIndex: 0})
	if err != nil {
		log.Printf("[role] Encounter error to get role record: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(roles)
	if jsonErr != nil {
		log.Printf("[role] Encounter error to encode roles record: %s", jsonErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	handler.Server.SendHTTPResponse(w, 0, "", string(jsonStr))
}

//HandleGetAccessRole get AccessRole records
func (handler *HTTPRequestHandler) HandleGetAccessRole(w http.ResponseWriter, r *http.Request) {

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

	accessRole, err := handler.RoleAccess.GetAccessRole(&RoleAccessSearchParam{
		Keyword:   "",
		AccessID:  accessID,
		RoleID:    roleID,
		PageSize:  pgSize,
		PageIndex: pgIndex})

	if err != nil {
		log.Printf("[access role] Encounter error to get access role record: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(accessRole)
	if jsonErr != nil {
		log.Printf("[access role] Encounter error to encode access role record: %s", jsonErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	handler.Server.SendHTTPResponse(w, 0, "", string(jsonStr))
}

//HandleGetAccessRoleCount get AccessRole records' count
func (handler *HTTPRequestHandler) HandleGetAccessRoleCount(w http.ResponseWriter, r *http.Request) {

	accessID := ""
	roleID := ""

	query := r.URL.Query()
	if strings.Compare(query.Get("accessID"), "") != 0 {
		accessID = query.Get("accessID")
	}
	if strings.Compare(query.Get("roleID"), "") != 0 {
		roleID = query.Get("roleID")
	}

	count, err := handler.RoleAccess.GetAccessRoleCount(&RoleAccessSearchParam{
		Keyword:  "",
		AccessID: accessID,
		RoleID:   roleID})

	if err != nil {
		log.Printf("[access role] Encounter error to get access role record: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(rowCount{Count: count})
	if jsonErr != nil {
		log.Printf("[access role] Encounter error to encode access role record: %s", jsonErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	handler.Server.SendHTTPResponse(w, 0, "", string(jsonStr))
}

//HandleGetAccess get Access records
func (handler *HTTPRequestHandler) HandleGetAccess(w http.ResponseWriter, r *http.Request) {

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

	access, err := handler.Access.GetAccess(&AccessSearchParam{
		Keyword:   "",
		PageSize:  pgSize,
		PageIndex: pgIndex})

	if err != nil {
		log.Printf("[access] Encounter error to get access record: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	jsonStr, jsonErr := json.Marshal(access)
	if jsonErr != nil {
		log.Printf("[access] Encounter error to encode access record: %s", jsonErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return
	}

	handler.Server.SendHTTPResponse(w, 0, "", string(jsonStr))
}
