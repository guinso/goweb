package authentication

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/guinso/goweb/server"
)

//RoleSQLite role store in SQLite medium
type RoleSQLite struct {
	DBProxy server.GetDBProxy
	Server  server.WebService
}

//NewRoleSQLite initialize a new role SQLite service instance
func NewRoleSQLite(serverParam server.WebService, getDBProxyFn server.GetDBProxy) *RoleSQLite {
	return &RoleSQLite{
		Server:  serverParam,
		DBProxy: getDBProxyFn}
}

//GetRoleByAccountID get list of roles based on account ID
func (role *RoleSQLite) GetRoleByAccountID(accountID string) ([]RoleInfo, error) {
	//SQL := "SELECT role_id FROM account_role WHERE account_id = ?"
	SQL := "SELECT role.id, role.name FROM role LEFT JOIN account_role ON role.id = account_role.role_id WHERE account_role.account_id = ?"

	rows, err := role.DBProxy().Query(SQL, accountID)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	result := []RoleInfo{}
	for rows.Next() {
		var tmpID, tmpName string
		if err = rows.Scan(&tmpID, &tmpName); err != nil {
			//rows.Close()
			return nil, err
		}

		result = append(result, RoleInfo{Name: tmpName, ID: tmpID})
	}

	return result, nil
}

//AddRole add role into database
func (role *RoleSQLite) AddRole(roleName string) error {
	SQL := "INSERT INTO role (id, name) VALUES (?, ?)"

	if _, err := role.DBProxy().Exec(SQL, role.Server.GetRandomRunningNumber("role"), roleName); err != nil {
		return err
	}

	return nil
}

//GetRoleIDByName get role ID by providing role name
//if return value is empty string means no record found
func (role *RoleSQLite) GetRoleIDByName(roleName string) (string, error) {
	rows, err := role.DBProxy().Query("SELECT id FROM role WHERE name = ?", roleName)
	if err != nil {
		return "", err
	}

	count := 0
	roleID := ""
	for rows.Next() {
		var tmpID string
		if err = rows.Scan(&tmpID); err != nil {
			rows.Close()
			return "", err
		}

		roleID = tmpID
		count++
	}
	rows.Close()

	if count > 1 {
		return "", fmt.Errorf(
			"Role <%s> record should not register more than one, but found %d",
			roleName, count)
	}

	// if count == 0 {
	// 	return "", nil //fmt.Errorf("Role <%s> not found in database", roleName)
	// }

	return roleID, nil
}

//GetRole get role records
func (role *RoleSQLite) GetRole(searchParam *RoleSearchParam) ([]RoleInfo, error) {
	var rows *sql.Rows
	var dbErr error
	if strings.Compare(searchParam.Keyword, "") == 0 {
		rows, dbErr = role.DBProxy().Query("SELECT id, name FROM role LIMIT ? OFFSET ?",
			searchParam.PageSize, searchParam.PageIndex*searchParam.PageSize)
	} else {
		rows, dbErr = role.DBProxy().Query("SELECT id, name FROM role WHERE name LIKE ? LIMIT ? OFFSET ?",
			"%"+searchParam.Keyword+"%", searchParam.PageSize, searchParam.PageIndex*searchParam.PageSize)
	}

	if dbErr != nil {
		return nil, dbErr
	}

	result := []RoleInfo{}
	for rows.Next() {
		tmp := RoleInfo{}

		if scanErr := rows.Scan(&tmp.ID, &tmp.Name); scanErr != nil {
			rows.Close()
			return nil, scanErr
		}

		result = append(result, tmp)
	}
	rows.Close()

	return result, nil
}

//UpdateRole change role name
func (role *RoleSQLite) UpdateRole(roleName string, newRoleName string) error {

	//check role exists or not
	roleID, err := role.GetRoleIDByName(roleName)
	if err != nil {
		return err
	}
	if strings.Compare(roleID, "") == 0 {
		return errors.New("Role " + roleName + " not found")
	}

	//confirm new role not register into database yet
	dumbID, dumbErr := role.GetRoleIDByName(newRoleName)
	if err != nil {
		return dumbErr
	}
	if strings.Compare(dumbID, "") != 0 {
		return errors.New("Targeted new role name " + newRoleName + " already registered")
	}

	//update role
	_, execErr := role.DBProxy().Exec("UPDATE role SET name = ? WHERE id = ?", newRoleName, roleID)
	if execErr != nil {
		return execErr
	}

	return nil
}
