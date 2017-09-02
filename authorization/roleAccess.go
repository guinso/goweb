package authorization

import (
	"fmt"

	"github.com/guinso/goweb/util"
	"github.com/guinso/rdbmstool"
)

//IsAuthorize check provided user is eligible to access specified subject
func IsAuthorize(db rdbmstool.DbHandlerProxy, accountID, accessName string) (bool, error) {
	sql := "SELECT id FROM access WHERE name = ?"

	rows, err := db.Query(sql, accessName)
	if err != nil {
		return false, err
	}

	count := 0
	accessID := ""

	for rows.Next() {
		var tmpID string
		if err = rows.Scan(&tmpID); err != nil {
			rows.Close()
			return false, err
		}

		accessID = tmpID
		count++
	}
	rows.Close()

	if count != 1 {
		return false, fmt.Errorf(
			"Access <%s> should only exists not more than one but found %d instead",
			accessName, count)
	}

	return isAuthorize(db, accountID, accessID)
}

//isAuthorize check provided user is eligible to access specified subject
func isAuthorize(db rdbmstool.DbHandlerProxy, accountID string, accessID string) (bool, error) {

	SQL := "SELECT SUM(a.is_authorize) FROM role_access a " +
		"INNER JOIN account_role b ON a.role_id = b.role_id " +
		"WHERE b.account_id = ? AND a.access_id = ?"

	rows, queryErr := db.Query(SQL, accountID, accessID)
	if queryErr != nil {
		return false, queryErr
	}

	result := false

	//only one record can exists
	if rows.Next() {
		var tmpCount int
		if err := rows.Scan(&tmpCount); err != nil {
			return false, err
		}

		result = tmpCount > 0
	}
	rows.Close()

	return result, nil
}

//AddRoleAccess add role access record into database
func AddRoleAccess(db rdbmstool.DbHandlerProxy, roleName, accessName string, isAuthorize bool) error {
	roleID, roleErr := GetRoleIDByName(db, roleName)
	if roleErr != nil {
		return roleErr
	}

	accessID, accessErr := GetAccessIDByName(db, accessName)
	if accessErr != nil {
		return accessErr
	}

	authValue := 0
	if isAuthorize {
		authValue = 1
	}

	_, err := db.Exec("INSERT INTO role_access (id, access_id, role_id, is_authorize) VALUES (?, ?, ?, ?)",
		util.GetRandomRunningNumber("role_access"),
		accessID,
		roleID,
		authValue)

	return err
}

//UpdateRoleAccessAuthorization update role access authorization
func UpdateRoleAccessAuthorization(db rdbmstool.DbHandlerProxy,
	roleName, accessName string, isAuthorize bool) error {

	roleID, roleErr := GetRoleIDByName(db, roleName)
	if roleErr != nil {
		return roleErr
	}

	accessID, accessErr := GetAccessIDByName(db, accessName)
	if accessErr != nil {
		return accessErr
	}

	authValue := 0
	if isAuthorize {
		authValue = 1
	}

	_, err := db.Exec("UPDATE role_access is_authorize = ? WHERE access_id = ? AND role_id = ?)",
		util.GetRandomRunningNumber("role_access"),
		authValue,
		accessID,
		roleID)

	return err
}
