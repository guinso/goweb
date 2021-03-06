package authentication

/***********************************
authentication login status is keep in database, each record will hold user ID, login time stamp, and released hash key
Hash key is generated by server side when client login request success
Hash key will keep by client as access token; each time client send request needed to attach with the access token (hash key)
Common practice to attach hash key is by using cookies OR URL parameter
************************************/

import (
	"database/sql"
	"strconv"
	"strings"
	"time"

	//"github.com/go-sql-driver/mysql"
	"github.com/guinso/rdbmstool"
	"github.com/guinso/stringtool"
	mysql "gopkg.in/go-sql-driver/mysql.v1"
)

//AuthMySQL authentication service using HTTP session to keep login and MySQL at storage medium
type AuthMySQL struct {
	Db      rdbmstool.DbHandlerProxy
	Account AccountService
}

//Login try register user to login session if
//1. username and password matched
//2. no one is login
//return: login result, hash key, exception error message
func (auth *AuthMySQL) Login(request *LoginRequest) (LoginStatus, string, error) {

	accInfo, err := auth.Account.GetAccountByUsername(request.Username)
	if err != nil {
		return LoginFailed, "", err
	}

	if accInfo == nil {
		return LoginFailed, "", err //no username found in database
	}

	if strings.Compare(accInfo.SaltedPwd, stringtool.MakeSHA256(request.Password)) == 0 {
		now := time.Now()

		//right now is single device login session pattern
		loginStatus, hashKey, err := auth.registerLoginSession(auth.Db, accInfo, now)
		if err != nil {
			return LoginFailed, "", err
		}

		return loginStatus, hashKey, nil
	}

	return LoginFailed, "", nil //password not match
}

//Logout try end user login session
func (auth *AuthMySQL) Logout(hashKey string) (bool, error) {

	loginSession, err := auth.getLoginSessionByHashKey(auth.Db, hashKey)
	if err != nil {
		return false, err
	}

	if loginSession == nil {
		return true, nil //make fool on potential attacker
	} else if loginSession.IsStillActive() {
		//update login session to expired
		if err = auth.endLoginSessionByHashKey(auth.Db, hashKey); err != nil {
			return false, err
		}
	}

	return true, nil //login session already logout
}

//GetCurrentLoginAccount get current active session's user ID
//anonymous user will return nil object
func (auth *AuthMySQL) GetCurrentLoginAccount(hashKey string) (*AccountInfo, error) {

	loginSession, err := auth.getLoginSessionByHashKey(auth.Db, hashKey)
	if err != nil {
		return nil, err //encounter  error
	}

	if loginSession == nil {
		return nil, nil //record not found (virtually not login yet)
	}

	if loginSession.IsStillActive() {
		return auth.Account.GetAccountByID(loginSession.AccountID)
	}

	return nil, nil //login session already been logged out
}

//RegisterLoginSession register latest login session record
//return hashkey and error message if encounter exception
func (auth *AuthMySQL) registerLoginSession(db rdbmstool.DbHandlerProxy, accountInfo *AccountInfo, logTime time.Time) (LoginStatus, string, error) {
	hashKey := strconv.FormatInt(logTime.UnixNano(), 10)

	//validate login session
	currentLoginSession, err := auth.getLoginSessionByAccountID(db, accountInfo.AccountID)
	if err != nil {
		return LoginFailed, "", err
	}

	if currentLoginSession == nil {
		//create new login session
		if err := auth.addLoginSessionRecord(db, accountInfo.AccountID, hashKey, logTime); err != nil {
			return LoginFailed, "", err
		}

		return LoggedIn, hashKey, nil

	}

	//renew login session
	hashKey, renewErr := auth.renewLoginSession(db, accountInfo.AccountID, hashKey, logTime)
	if renewErr != nil {
		return LoginFailed, "", renewErr
	}

	return LoggedIn, hashKey, nil
}

//AddLoginSessionRecord add login session record
func (auth *AuthMySQL) addLoginSessionRecord(db rdbmstool.DbHandlerProxy, userID string, hashKey string, now time.Time) error {
	//update database login session table
	insertSQL := "INSERT INTO login_session (id, account_id, hash_key, login, last_seen) VALUES (?, ?, ?, ?, ?)"

	_, err := db.Exec(insertSQL,
		stringtool.MakeMD5("login_session"+strconv.FormatInt(now.UnixNano(), 10)),
		userID,
		hashKey,
		now.Format("2006-01-02 15:04:05"),
		now.Format("2006-01-02 15:04:05"))

	if err != nil {
		return err
	}

	return nil
}

//RenewLoginSession renew login session with new hash key and time log
//return hashkey and error message if encounter exception
func (auth *AuthMySQL) renewLoginSession(db rdbmstool.DbHandlerProxy, accountID string, hashKey string, logTime time.Time) (string, error) {
	updateSQL := "UPDATE login_session SET hash_key = ?, login = ?, logout = null, last_seen = ?" +
		" WHERE account_id = ?"

	logTimeFormat := logTime.Format("2006-01-02 15:04:05")
	if _, err := db.Exec(
		updateSQL, hashKey, logTimeFormat, logTimeFormat, accountID); err != nil {
		return "", err
	}

	return hashKey, nil
}

//EndLoginSessionByAccountID mark login session for specified user to become logout
func (auth *AuthMySQL) endLoginSessionByAccountID(db rdbmstool.DbHandlerProxy, accountID string) error {
	updateSQL := "UPDATE login_session SET (logout = ?) WHERE account_id = ?"

	if _, err := db.Exec(updateSQL,
		time.Now().Format("2006-01-02 15:04:05"), accountID); err != nil {
		return err
	}

	return nil
}

//EndLoginSessionByHashKey mark login session for specified user to become logout
func (auth *AuthMySQL) endLoginSessionByHashKey(db rdbmstool.DbHandlerProxy, hashKey string) error {
	updateSQL := "UPDATE login_session SET logout = ? WHERE hash_key = ?"

	if _, err := db.Exec(updateSQL,
		time.Now().Format("2006-01-02 15:04:05"), hashKey); err != nil {
		return err
	}

	return nil
}

//GetLoginSessionByHashKey get Login session record by hash key
//hash key is provided from client's cookies; please refer SessionHandler.go
func (auth *AuthMySQL) getLoginSessionByHashKey(db rdbmstool.DbHandlerProxy, hashKey string) (*LoginSession, error) {
	SQL := "SELECT id, account_id, hash_key, login, logout, last_seen FROM login_session WHERE hash_key = ?"

	rows, err := db.Query(SQL, hashKey)
	if err != nil {
		return nil, err
	}

	return auth.formatLoginSession(rows)
}

//GetLoginSessionByAccountID get Login session record by account ID
func (auth *AuthMySQL) getLoginSessionByAccountID(db rdbmstool.DbHandlerProxy, accountID string) (*LoginSession, error) {
	SQL := "SELECT id, account_id, hash_key, login, logout, last_seen FROM login_session WHERE account_id = ?"

	rows, err := db.Query(SQL, accountID)
	if err != nil {
		return nil, err
	}

	return auth.formatLoginSession(rows)
}

func (auth *AuthMySQL) formatLoginSession(rows *sql.Rows) (*LoginSession, error) {
	if rows.Next() {
		var tmpID, tmpUserID, tmpHash string
		var tmpLogin, tmpLastSeen mysql.NullTime
		var tmpLogout mysql.NullTime

		if err := rows.Scan(&tmpID, &tmpUserID, &tmpHash, &tmpLogin, &tmpLogout, &tmpLastSeen); err != nil {
			rows.Close()
			return nil, err
		}

		rows.Close()

		result := LoginSession{
			ID:        tmpID,
			AccountID: tmpUserID,
			HashKey:   tmpHash,
			Login:     tmpLogin.Time,
			LastSeen:  tmpLastSeen.Time,
		}

		if tmpLogout.Valid {
			result.Logout = tmpLogout.Time
		} else {
			result.Logout = time.Time{}
		}

		return &result, nil
	}

	return nil, nil
}
