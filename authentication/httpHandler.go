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
		var loginReq LoginRequest

		err := util.DecodeJSON(r, &loginReq)
		if err != nil {
			fmt.Printf("[login] error to read user input: %s", err.Error())
			util.SendHTTPErrorResponse(w)
			return true
		}

		loginStatus, hashKey, loginErr := Login(db, loginReq.Username, loginReq.Password)
		if loginErr != nil {
			fmt.Printf("[login] Encounter error to attempt Login(...): %s", loginErr.Error())
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

	} else if strings.HasPrefix(trimURL, "logout") && util.IsPOST(r) {
		return false //not implemented yet...
	}

	return false
}
