package authentication

import (
	"database/sql"
	"strconv"
	"time"

	"github.com/go-sql-driver/mysql"
	"github.com/guinso/rdbmstool"
	"github.com/guinso/stringtool"
)

//LoginSession login session store at database
type LoginSession struct {
	ID        string
	AccountID string
	HashKey   string
	Login     time.Time
	Logout    time.Time //need to verify is zero time
	LastSeen  time.Time
}

//IsStillActive get status weather login session is active or not
func (session *LoginSession) IsStillActive() bool {
	return session.Logout.IsZero()
}

//RegisterLoginSession register latest login session record
//return hashkey and error message if encounter exception
func registerLoginSession(db rdbmstool.DbHandlerProxy, accountInfo *AccountInfo, logTime time.Time) (LoginStatus, string, error) {
	hashKey := strconv.FormatInt(logTime.UnixNano(), 10)

	//validate login session
	currentLoginSession, err := getLoginSessionByAccountID(db, accountInfo.AccountID)
	if err != nil {
		return LoginFailed, "", err
	}

	if currentLoginSession == nil {
		//create new login session
		if err := addLoginSessionRecord(db, accountInfo.AccountID, hashKey, logTime); err != nil {
			return LoginFailed, "", err
		}

		return LoginSuccess, hashKey, nil

	} else if !currentLoginSession.IsStillActive() {
		//renew login session
		hashKey, err := renewLoginSession(db, accountInfo.AccountID, hashKey, logTime)
		if err != nil {
			return LoginFailed, "", err
		}

		return LoginSuccess, hashKey, nil
	}

	//reject login attempt as there is an active login session
	return AlreadyLoggedIn, "", nil
}

//AddLoginSessionRecord add login session record
func addLoginSessionRecord(db rdbmstool.DbHandlerProxy, userID string, hashKey string, now time.Time) error {
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
func renewLoginSession(db rdbmstool.DbHandlerProxy, accountID string, hashKey string, logTime time.Time) (string, error) {
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
func endLoginSessionByAccountID(db rdbmstool.DbHandlerProxy, accountID string) error {
	updateSQL := "UPDATE login_session SET (logout = ?) WHERE account_id = ?"

	if _, err := db.Exec(updateSQL,
		time.Now().Format("2006-01-02 15:04:05"), accountID); err != nil {
		return err
	}

	return nil
}

//EndLoginSessionByHashKey mark login session for specified user to become logout
func endLoginSessionByHashKey(db rdbmstool.DbHandlerProxy, hashKey string) error {
	updateSQL := "UPDATE login_session SET logout = ? WHERE hash_key = ?"

	if _, err := db.Exec(updateSQL,
		time.Now().Format("2006-01-02 15:04:05"), hashKey); err != nil {
		return err
	}

	return nil
}

//GetLoginSessionByHashKey get Login session record by hash key
//hash key is provided from client's cookies; please refer SessionHandler.go
func getLoginSessionByHashKey(db rdbmstool.DbHandlerProxy, hashKey string) (*LoginSession, error) {
	SQL := "SELECT id, account_id, hash_key, login, logout, last_seen FROM login_session WHERE hash_key = ?"

	rows, err := db.Query(SQL, hashKey)
	if err != nil {
		return nil, err
	}

	return formatLoginSession(rows)
}

//GetLoginSessionByAccountID get Login session record by account ID
func getLoginSessionByAccountID(db rdbmstool.DbHandlerProxy, accountID string) (*LoginSession, error) {
	SQL := "SELECT id, account_id, hash_key, login, logout, last_seen FROM login_session WHERE account_id = ?"

	rows, err := db.Query(SQL, accountID)
	if err != nil {
		return nil, err
	}

	return formatLoginSession(rows)
}

func formatLoginSession(rows *sql.Rows) (*LoginSession, error) {
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
