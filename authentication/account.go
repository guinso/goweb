package authentication

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/guinso/goweb/util"
	"github.com/guinso/rdbmstool/query"
	"github.com/guinso/stringtool"

	"github.com/guinso/rdbmstool"
)

//AccountInfo account info from database
type AccountInfo struct {
	//AccountId account ID
	AccountID string `json:"id"`
	//Username username
	Username string `json:"username"`
	//SaltedPwd pasword that had been hashed
	SaltedPwd string `json:"-"`

	Roles []string `json:"-"`
}

//AccountSearchParam search account parameter
type AccountSearchParam struct {
	PageSize  int
	PageIndex int
	Keyword   string
}

//AddAccount insert new account record into database
func AddAccount(db rdbmstool.DbHandlerProxy, username, password string) error {
	sql := "INSERT INTO account (id, username, pwd) VALUES (?, ?, ?)"

	id := util.GetRandomRunningNumber("account")

	_, err := db.Exec(sql, id, username, stringtool.MakeSHA256(password))
	return err
}

//ChangeAccountPassword change account's password if old password match
func ChangeAccountPassword(db rdbmstool.DbHandlerProxy, username, oldPwd, newPwd string) error {
	account, err := GetAccountByName(db, username)
	if err != nil {
		return err
	}

	saltedOldPwd := stringtool.MakeSHA256(oldPwd)
	if strings.Compare(saltedOldPwd, account.SaltedPwd) != 0 {
		return errors.New("Failed to change password; make sure you provide correct username and password")
	}

	updateSQL := "UPDATE account SET pwd = ? WHERE id = ?"
	_, err = db.Exec(updateSQL, stringtool.MakeSHA256(newPwd), account.AccountID)

	return err
}

//GetAccountByName get account information by user name
func GetAccountByName(db rdbmstool.DbHandlerProxy, username string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE username = ?"

	rows, err := db.Query(sql, username)
	if err != nil {
		return nil, err
	}

	if rows.Next() {
		result, resultErr := formatAccountInfo(db, rows)
		rows.Close()

		return result, resultErr
	}

	return nil, nil
}

//GetAccountByID get account information by user ID
func GetAccountByID(db rdbmstool.DbHandlerProxy, userID string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE id = ?"

	rows, err := db.Query(sql, userID)
	if err != nil {
		return nil, err
	}

	if rows.Next() {
		result, resultErr := formatAccountInfo(db, rows)
		rows.Close()

		return result, resultErr
	}

	return nil, nil
}

//GetAccount get account
func GetAccount(db rdbmstool.DbHandlerProxy, parameter AccountSearchParam) ([]AccountInfo, error) {
	//sanatize parameter
	parameter.Keyword = strings.TrimSpace(parameter.Keyword)

	if parameter.PageIndex < 0 {
		parameter.PageIndex = 0
	}

	if parameter.PageSize < 1 {
		parameter.PageSize = 10
	}

	result := []AccountInfo{}
	sqlStr, err := query.NewSelectSQLBuilder().
		Select("*", "").
		From("account", "").
		WhereOR(query.LIKE, "username", "?").
		Limit(parameter.PageSize, parameter.PageIndex*parameter.PageSize).
		SQL()

	if err != nil {
		return nil, err
	}

	stmt, stmtErr := db.Prepare(sqlStr)
	if stmtErr != nil {
		return nil, stmtErr
	}
	rows, queryErr := stmt.Query(parameter.Keyword)
	if queryErr != nil {
		return nil, queryErr
	}

	for rows.Next() {
		accInfo, accErr := formatAccountInfo(db, rows)
		if accErr != nil {
			rows.Close()
			return nil, accErr
		}

		result = append(result, *accInfo)
	}
	rows.Close()

	return result, nil
}

func formatAccountInfo(db rdbmstool.DbHandlerProxy, rows *sql.Rows) (*AccountInfo, error) {
	//defer rows.Close()

	//if rows.Next() {
	var tmpID, tmpUsername, tmpPwd string
	if err := rows.Scan(&tmpID, &tmpUsername, &tmpPwd); err != nil {
		//rows.Close()
		return nil, err
	}

	//rows.Close()

	//get all related roles
	roles, err := getRolesByAccountID(db, tmpID)
	if err != nil {
		return nil, err
	}

	return &AccountInfo{
		AccountID: tmpID,
		Username:  tmpUsername,
		SaltedPwd: tmpPwd,
		Roles:     roles,
	}, nil
	//}

	//return nil, nil
}
