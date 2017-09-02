package authentication

import (
	"database/sql"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/guinso/goweb/util"
)

//HandleHTTPRequest handle incoming http request
//return true if request URL match and process
func HandleHTTPRequest(db *sql.DB, w http.ResponseWriter, r *http.Request, trimURL string) bool {
	if strings.HasPrefix(trimURL, "login") && util.IsPOST(r) {
		return handleHTTPLogin(db, w, r)
	} else if strings.HasPrefix(trimURL, "logout") && util.IsPOST(r) {
		return handleHTTPLogout(db, w, r)
	}

	return false
}

func handleHTTPLogin(db *sql.DB, w http.ResponseWriter, r *http.Request) bool {
	var loginReq LoginRequest

	err := util.DecodeJSON(r, &loginReq)
	if err != nil {
		fmt.Printf("[login] error to read user input: %s", err.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}

	trx, trxErr := db.Begin()
	if trxErr != nil {
		fmt.Printf("[login] error to begin SQL transaction: %s", trxErr.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}

	loginStatus, hashKey, loginErr := Login(trx, loginReq.Username, loginReq.Password)
	if loginErr != nil {
		trx.Rollback()
		fmt.Printf("[login] Encounter error to attempt Login(...): %s", loginErr.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}

	if err = trx.Commit(); err != nil {
		fmt.Printf("[login] error to commit SQL transaction: %s", trxErr.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}

	switch loginStatus {
	case LoginSuccess:
		//pass unique ID to cookie
		//NOTE: memory cookies can set by not providing value to property 'Expires'
		cookie := http.Cookie{
			Name:    cookieKey,
			Value:   hashKey,
			Expires: time.Now().Add(time.Hour * 2), //expire after 2 hours
		}
		http.SetCookie(w, &cookie)

		util.SendHTTPResponse(w, 0, "login success", "")
		break
	case LoginFailed:
		util.SendHTTPResponse(w, -1, "username or password not match", "{}")
		return true
	case AlreadyLoggedIn:
		msg := fmt.Sprintf(
			"user <%s> already logged in. Please logout and try again\n",
			loginReq.Username)
		util.SendHTTPResponse(w, -1, msg, "{}")
		break
	default:
		fmt.Printf("[login] unknown login status: %d\n", loginStatus)
		util.SendHTTPErrorResponse(w)
		break
	}

	return true
}

func handleHTTPLogout(db *sql.DB, w http.ResponseWriter, r *http.Request) bool {
	cookie, _ := r.Cookie(cookieKey)
	if cookie == nil {
		//cookie not found; either timeout or logged out
		util.SendHTTPResponse(w, -1, "Logout rejected, you are not login yet", "{}")
		return true
	}

	trx, trxErr := db.Begin()
	if trxErr != nil {
		fmt.Printf("[logout] failed to begin SQL transaction: %s\n", trxErr.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}
	result, err := Logout(trx, cookie.Value)
	if err != nil {
		trx.Rollback()
		fmt.Printf("[logout] error on Logout: %s\n", err.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}

	if err = trx.Commit(); err != nil {
		fmt.Printf("[logout] failed to commit SQL transaction: %s\n", trxErr.Error())
		util.SendHTTPErrorResponse(w)
		return true
	}

	if result {
		util.SendHTTPResponse(w, 0, "logout success", "{}")
	} else {
		util.SendHTTPResponse(w, -1, "logout request rejected", "{}")
	}

	return true
}
