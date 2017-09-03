package authorization

import (
	"database/sql"
	"net/http"
	"strings"

	"github.com/guinso/goweb/util"
)

//HandleHTTPRequest handle incoming http request
//return true if request URL match and process
func HandleHTTPRequest(db *sql.DB, w http.ResponseWriter, r *http.Request, trimURL string) bool {
	if strings.HasPrefix(trimURL, "role") && util.IsPOST(r) {

	} else if strings.HasPrefix(trimURL, "role") && util.IsGET(r) {

	}

	return false
}
