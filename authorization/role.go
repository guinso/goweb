package authorization

import (
	"fmt"

	"github.com/guinso/goweb/util"
	"github.com/guinso/rdbmstool"
)

//AddRole add role into database
func AddRole(db rdbmstool.DbHandlerProxy, roleName string) error {
	SQL := "INSERT INTO role (id, name) VALUES (?, ?)"

	if _, err := db.Exec(SQL, util.GetRandomRunningNumber("role"), roleName); err != nil {
		return err
	}

	return nil
}

//GetRoleIDByName get role ID by providing role name
func GetRoleIDByName(db rdbmstool.DbHandlerProxy, roleName string) (string, error) {
	rows, err := db.Query("SELECT id FROM role WHERE name = ?", roleName)
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

	if count == 0 {
		return "", fmt.Errorf("Role <%s> not found in database", roleName)
	}

	return roleID, nil
}

//AddAccountRole add account role into database
func AddAccountRole(db rdbmstool.DbHandlerProxy, accountID, roleName string) error {
	roleID, err := GetRoleIDByName(db, roleName)
	if err != nil {
		return err
	}

	_, err = db.Exec(
		"INSERT INTO account_role (id, account_id, role_id) VALUES (?, ?, ?)",
		util.GetRandomRunningNumber("account_role"),
		accountID,
		roleID)

	return err
}
