package authetication

import (
	"database/sql"
	"errors"
	"strings"

	"github.com/guinso/goweb/routing"
	"github.com/guinso/stringtool"

	"github.com/guinso/rdbmstool"
)

//AccountInfo account info from database
type AccountInfo struct {
	//AccountId account ID
	AccountID string
	//Username username
	Username string
	//SaltedPwd pasword that had been hashed
	SaltedPwd string

	Roles []string
}

//AddAccount insert new account record into database
func AddAccount(db rdbmstool.DbHandlerProxy, username, password string) error {
	sql := "INSERT INTO account (id, username, pwd) VALUES (?, ?, ?)"

	id := routing.GetRandomRunningNumber("account")

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

	row := db.QueryRow(sql, username)

	return formatAccountInfo(db, row)
}

//GetAccountByID get account information by user ID
func GetAccountByID(db rdbmstool.DbHandlerProxy, userID string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE id = ?"

	row := db.QueryRow(sql, userID)

	return formatAccountInfo(db, row)
}

func formatAccountInfo(db rdbmstool.DbHandlerProxy, row *sql.Row) (*AccountInfo, error) {
	if row != nil {
		var tmpID, tmpUsername, tmpPwd string
		if err := row.Scan(&tmpID, &tmpUsername, &tmpPwd); err != nil {
			return nil, err
		}

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
	}

	return nil, nil
}
