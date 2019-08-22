package authentication

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"localsrc/server"

	"github.com/guinso/stringtool"

	"github.com/guinso/rdbmstool"
)

//AccountSQLite account service store in SQLite medium
type AccountSQLite struct {
	DBProxy server.GetDBProxy
	Role    *RoleSQLite
	Server  server.WebService
}

//NewAccountSQLite Initialize a new instance of Account SQLite service
func NewAccountSQLite(serverParam server.WebService, getDBProxyFn server.GetDBProxy) *AccountSQLite {
	return &AccountSQLite{
		DBProxy: getDBProxyFn,
		Server:  serverParam,
		Role:    NewRoleSQLite(serverParam, getDBProxyFn)}
}

//AddAccount insert new account record into database
func (account *AccountSQLite) AddAccount(username, password string) error {
	sql := "INSERT INTO account (id, username, pwd) VALUES (?, ?, ?)"

	id := account.Server.GetRandomRunningNumber("account")

	_, err := account.DBProxy().Exec(sql, id, username, stringtool.MakeSHA256(password))
	return err
}

//ChangeAccountPassword change account's password if old password match
func (account *AccountSQLite) ChangeAccountPassword(username, oldPwd, newPwd string) error {
	accountInfo, err := account.GetAccountByUsername(username)
	if err != nil {
		return err
	}

	saltedOldPwd := stringtool.MakeSHA256(oldPwd)
	if strings.Compare(saltedOldPwd, accountInfo.SaltedPwd) != 0 {
		return errors.New("Failed to change password; make sure you provide correct username and password")
	}

	updateSQL := "UPDATE account SET pwd = ? WHERE id = ?"
	_, err = account.DBProxy().Exec(updateSQL, stringtool.MakeSHA256(newPwd), accountInfo.AccountID)

	return err
}

//GetAccountByUsername get account information by user name
func (account *AccountSQLite) GetAccountByUsername(username string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE username = ?"

	rows, err := account.DBProxy().Query(sql, username)
	if err != nil {
		return nil, err
	}

	var result *AccountInfo
	var rowErr error

	if rows.Next() {
		result, rowErr = account.formatAccountInfo(rows)
	}

	rows.Close()

	if rowErr != nil {
		return nil, rowErr
	}

	if result != nil {
		if addErr := account.addUserRoles(result); addErr != nil {
			return nil, addErr
		}
	}

	return result, nil
}

//GetAccountByID get account information by user ID
func (account *AccountSQLite) GetAccountByID(userID string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE id = ?"

	rows, err := account.DBProxy().Query(sql, userID)
	if err != nil {
		return nil, err
	}

	var result *AccountInfo
	var rowErr error

	if rows.Next() {
		result, rowErr = account.formatAccountInfo(rows)
	}

	rows.Close()

	if rowErr != nil {
		return nil, rowErr
	}

	if result != nil {
		if addErr := account.addUserRoles(result); addErr != nil {
			return nil, addErr
		}
	}

	return result, nil
}

//GetAccount get account
func (account *AccountSQLite) GetAccount(parameter *AccountSearchParam) ([]AccountInfo, error) {
	//sanatize parameter
	parameter.Keyword = strings.TrimSpace(parameter.Keyword)

	if parameter.PageIndex < 0 {
		parameter.PageIndex = 0
	}

	if parameter.PageSize < 1 {
		parameter.PageSize = 10
	}

	result := []AccountInfo{}
	sqlStr, err := rdbmstool.NewQueryBuilder().
		Select("*", "").
		From("account", "").
		WhereAddOr("username LIKE ?").
		Limit(parameter.PageSize, parameter.PageIndex*parameter.PageSize).
		SQL()

	if err != nil {
		return nil, err
	}

	stmt, stmtErr := account.DBProxy().Prepare(sqlStr)
	if stmtErr != nil {
		return nil, stmtErr
	}
	rows, queryErr := stmt.Query(parameter.Keyword)
	if queryErr != nil {
		return nil, queryErr
	}

	for rows.Next() {
		accInfo, accErr := account.formatAccountInfo(rows)
		if accErr != nil {
			rows.Close()
			return nil, accErr
		}

		result = append(result, *accInfo)
	}
	rows.Close()

	for _, acc := range result {
		if err := account.addUserRoles(&acc); err != nil {
			return nil, err
		}
	}

	return result, nil
}

//AddAccountRole add account role into database
func (account *AccountSQLite) AddAccountRole(accountID, roleName string) error {
	roleID, err := account.Role.GetRoleIDByName(roleName)
	if err != nil {
		return err
	} else if len(roleID) == 0 {
		return fmt.Errorf("Role '%s' not exists in database", roleName)
	}

	accountInfo, err := account.GetAccountByID(accountID)
	if err != nil {
		return err
	} else if accountInfo == nil {
		return fmt.Errorf("Account ID '%s' not exists in database", accountID)
	}

	rows, err := account.DBProxy().Query("SELECT * FROM account_role WHERE account_id = ? AND role_id = ?", accountID, roleID)
	if err != nil {
		return err
	}
	defer rows.Close()
	count := 0
	for rows.Next() {
		count++
	}
	if count > 0 {
		return fmt.Errorf("Account Role with '%s'(Account) , '%s'(role) already exists", accountInfo.Username, roleName)
	}

	_, err = account.DBProxy().Exec(
		"INSERT INTO account_role (id, account_id, role_id) VALUES (?, ?, ?)",
		account.Server.GetRandomRunningNumber("account_role"),
		accountID,
		roleID)

	return err
}

func (account *AccountSQLite) formatAccountInfo(rows *sql.Rows) (*AccountInfo, error) {

	var tmpID, tmpUsername, tmpPwd string
	if err := rows.Scan(&tmpID, &tmpUsername, &tmpPwd); err != nil {
		return nil, err
	}

	return &AccountInfo{
		AccountID: tmpID,
		Username:  tmpUsername,
		SaltedPwd: tmpPwd,
		Roles:     []RoleInfo{},
		//Roles:     roles,
	}, nil
}

func (account *AccountSQLite) addUserRoles(accountInfo *AccountInfo) error {
	//get all related roles
	roles, err := account.Role.GetRoleByAccountID(accountInfo.AccountID)
	if err != nil {
		return err
	}

	accountInfo.Roles = roles

	return nil
}
