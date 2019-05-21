package authentication

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/guinso/rdbmstool"

	"github.com/guinso/goweb/server"
)

//HTTPRequestHandler HTTP request handler for authentication
type HTTPRequestHandler struct {
	DB        *sql.DB
	Server    server.WebServer
	Auth      *AuthSessionSQLite
	dbProxy   rdbmstool.DbHandlerProxy
	CookieKey string
}

//NewHTTPRequestHandler instantiate a new HTTP request handler
func NewHTTPRequestHandler(serverParam server.WebServer, DBparam *sql.DB, authSessionKey string) *HTTPRequestHandler {
	handler := &HTTPRequestHandler{
		DB:        DBparam,
		Server:    serverParam,
		dbProxy:   DBparam,
		CookieKey: authSessionKey}

	handler.Auth = NewAuthSessionSQLite(serverParam, handler.getDBProxy)

	return handler
}

//GetDBProxy get database proxy
func (handler *HTTPRequestHandler) getDBProxy() rdbmstool.DbHandlerProxy {
	return handler.dbProxy
}

//HandleHTTPRequest handle incoming http request
//return true if request URL match and process
func (handler *HTTPRequestHandler) HandleHTTPRequest(db *sql.DB, w http.ResponseWriter, r *http.Request, trimURL string) bool {
	if strings.HasPrefix(trimURL, "login") && handler.Server.IsPOST(r) {
		return handler.handleHTTPLogin(w, r)
	} else if strings.HasPrefix(trimURL, "logout") && handler.Server.IsPOST(r) {
		return handler.handleHTTPLogout(w, r)
	} else if strings.Compare(trimURL, "current-user") == 0 && handler.Server.IsGET(r) {
		return handler.handleCurrentUser(w, r)
	}

	return false
}

func (handler *HTTPRequestHandler) handleCurrentUser(w http.ResponseWriter, r *http.Request) bool {

	var user *AccountInfo

	cookie, err := r.Cookie(handler.CookieKey)
	if cookie == nil {
		//cookie not found; either timeout or logged out
		user = nil
	} else {
		hashKey := cookie.Value

		user, err = handler.Auth.GetCurrentLoginAccount(hashKey)
		if err != nil {
			handler.Server.SendHTTPErrorResponse(w)
			return true
		}
	}

	if user == nil {
		user = &AccountInfo{
			AccountID: "-",
			Username:  "",
			SaltedPwd: "",
			Roles:     []RoleInfo{}}
	}

	//TODO: end session if session expired and return anonymous user account

	jsonStr, jsonErr := json.Marshal(user)
	if jsonErr != nil {
		handler.Server.SendHTTPErrorResponse(w)
		log.Printf("[current-user] fail to encode JSON: %s\n", jsonErr.Error())
		return true
	}

	handler.Server.SendHTTPResponse(w, 0, "", string(jsonStr))

	return true
}

func (handler *HTTPRequestHandler) restoreDBSetting() {
	handler.dbProxy = handler.DB
}

func (handler *HTTPRequestHandler) handleHTTPLogin(w http.ResponseWriter, r *http.Request) bool {
	var loginReq LoginRequest

	err := handler.Server.DecodeJSON(r, &loginReq)
	if err != nil {
		log.Printf("[login] error to read user input: %s", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}

	trx, trxErr := handler.DB.Begin()
	if trxErr != nil {
		log.Printf("[login] error to begin SQL transaction: %s", trxErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}
	handler.dbProxy = trx
	defer handler.restoreDBSetting()

	loginStatus, hashKey, loginErr := handler.Auth.Login(&loginReq)
	if loginErr != nil {
		trx.Rollback()
		log.Printf("[login] Encounter error to attempt Login(...): %s", loginErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}

	if err = trx.Commit(); err != nil {
		log.Printf("[login] error to commit SQL transaction: %s", trxErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}

	switch loginStatus {
	case LoggedIn:
		//pass unique ID to cookie
		//NOTE: memory cookies can set by not providing value to property 'Expires'
		cookie := http.Cookie{
			Name:    handler.CookieKey,
			Value:   hashKey,
			Expires: time.Now().Add(time.Hour * 2), //expire after 2 hours
		}
		http.SetCookie(w, &cookie)

		handler.Server.SendHTTPResponse(w, 0, "login success", "{}")
		break
	case LoginFailed:
		handler.Server.SendHTTPResponse(w, -1, "username or password not match", "{}")
		return true
		// case AlreadyLoggedIn:
		// 	msg := fmt.Sprintf(
		// 		"user [%s] already logged in. Please logout and try it again",
		// 		loginReq.Username)
		// 	server.SendHTTPResponse(w, -1, msg, "{}")
		break
	default:
		log.Printf("[login] unknown login status: %d", loginStatus)
		handler.Server.SendHTTPErrorResponse(w)
		break
	}

	return true
}

func (handler *HTTPRequestHandler) handleHTTPLogout(w http.ResponseWriter, r *http.Request) bool {
	cookie, _ := r.Cookie(handler.CookieKey)
	if cookie == nil {
		//cookie not found; either timeout or logged out
		//x util.SendHTTPResponse(w, -1, "Logout rejected, you are not login yet", "{}")

		handler.Server.SendHTTPResponse(w, 0, "logout success", "{}")
		return true
	}

	trx, trxErr := handler.DB.Begin()
	if trxErr != nil {
		log.Printf("[logout] failed to begin SQL transaction: %s\n", trxErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}
	handler.dbProxy = trx
	defer handler.restoreDBSetting()

	result, err := handler.Auth.Logout(cookie.Value)
	if err != nil {
		trx.Rollback()
		log.Printf("[logout] error on Logout: %s\n", err.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}

	if err = trx.Commit(); err != nil {
		log.Printf("[logout] failed to commit SQL transaction: %s\n", trxErr.Error())
		handler.Server.SendHTTPErrorResponse(w)
		return true
	}

	if result {
		handler.Server.SendHTTPResponse(w, 0, "logout success", "{}")
	} else {
		handler.Server.SendHTTPResponse(w, -1, "logout request rejected", "{}")
	}

	return true
}
