package authorization

import (
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/guinso/goweb/util"
	"github.com/guinso/rdbmstool"
)

//Role user role
type Role struct {
	//Id role record id
	ID string `json:"id"`
	//Name role record name
	Name string `json:"name"`
}

//AddRole add role into database
func AddRole(db rdbmstool.DbHandlerProxy, roleName string) error {
	SQL := "INSERT INTO role (id, name) VALUES (?, ?)"

	if _, err := db.Exec(SQL, util.GetRandomRunningNumber("role"), roleName); err != nil {
		return err
	}

	return nil
}

//GetRoleIDByName get role ID by providing role name
//if return value is empty string means no record found
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
		return "", nil //fmt.Errorf("Role <%s> not found in database", roleName)
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

//GetRole get role records
func GetRole(db rdbmstool.DbHandlerProxy, keyword string, pageSize int, pageIndex int) ([]Role, error) {
	var rows *sql.Rows
	var dbErr error
	if strings.Compare(keyword, "") == 0 {
		rows, dbErr = db.Query("SELECT id, name FROM role LIMIT ? OFFSET ?",
			pageSize, pageIndex*pageSize)
	} else {
		rows, dbErr = db.Query("SELECT id, name FROM role WHERE name LIKE ? LIMIT ? OFFSET ?",
			"%"+keyword+"%", pageSize, pageIndex*pageSize)
	}

	if dbErr != nil {
		return nil, dbErr
	}

	result := []Role{}
	for rows.Next() {
		tmp := Role{}

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
func UpdateRole(db rdbmstool.DbHandlerProxy, roleName string, newRoleName string) error {

	//check role exists or not
	roleID, err := GetRoleIDByName(db, roleName)
	if err != nil {
		return err
	}
	if strings.Compare(roleID, "") == 0 {
		return errors.New("Role " + roleName + " not found")
	}

	//confirm new role not register into database yet
	dumbID, dumbErr := GetRoleIDByName(db, newRoleName)
	if err != nil {
		return dumbErr
	}
	if strings.Compare(dumbID, "") != 0 {
		return errors.New("Targeted new role name " + newRoleName + " already registered")
	}

	//update role
	_, execErr := db.Exec("UPDATE role SET name = ? WHERE id = ?", newRoleName, roleID)
	if execErr != nil {
		return execErr
	}

	return nil
}
