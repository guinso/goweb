package authorization

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/guinso/goweb/util"
	"github.com/guinso/rdbmstool"
)

//RoleAccess access description for related role
type RoleAccess struct {
	ID          string `json:"id"`
	Role        string `json:"role"`
	RoleID      string `json:"roleID"`
	Access      string `json:"access"`
	AccessID    string `json:"accessID"`
	IsAuthorize bool   `json:"isAuthorize"`
}

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
			rows.Close()
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

//GetAccessRole get access role records
func GetAccessRole(db rdbmstool.DbHandlerProxy, keyword string,
	accessIDFilter string, roleIDFilter string,
	pageSize int, pageIndex int) ([]RoleAccess, error) {
	var rows *sql.Rows
	var dbErr error

	sqlQuery := rdbmstool.NewQueryBuilder()
	sqlQuery.From("role_access", "a").
		Select("a.id", "").
		Select("a.role_id", "").
		Select("a.access_id", "").
		Select("b.name", "role").
		Select("c.name", "access").
		Select("a.is_authorize", "").
		Join("role", "b", rdbmstool.LeftJoin, "a.role_id = b.id").
		Join("access", "c", rdbmstool.LeftJoin, "a.access_id = c.id").
		Limit(pageSize, pageIndex)

	if strings.Compare(keyword, "") != 0 {
		sqlQuery.WhereAddOr("b.name LIKE '%" + keyword + "%'").
			WhereAddOr("c.name LIKE '%" + keyword + "%'")
	}

	if strings.Compare(accessIDFilter, "") != 0 {
		sqlQuery.WhereAddAnd("a.access_id = '" + accessIDFilter + "'")
	}

	if strings.Compare(roleIDFilter, "") != 0 {
		sqlQuery.WhereAddAnd("a.role_id = '" + roleIDFilter + "'")
	}

	sqlStr, sqlErr := sqlQuery.SQL()
	if sqlErr != nil {
		return nil, sqlErr
	}

	rows, dbErr = db.Query(sqlStr)
	if dbErr != nil {
		return nil, dbErr
	}

	result := []RoleAccess{}
	for rows.Next() {
		tmp := RoleAccess{}

		if err := rows.Scan(&tmp.ID, &tmp.RoleID, &tmp.AccessID, &tmp.Role, &tmp.Access, &tmp.IsAuthorize); err != nil {
			rows.Close()
			return nil, err
		}

		result = append(result, tmp)
	}
	rows.Close()

	return result, nil
}

//GetAccessRoleCount get access role records
func GetAccessRoleCount(db rdbmstool.DbHandlerProxy, keyword string,
	accessIDFilter string, roleIDFilter string) (int, error) {
	var rows *sql.Rows
	var dbErr error

	sqlQuery := rdbmstool.NewQueryBuilder()
	sqlQuery.From("role_access", "a").
		Select("COUNT(a.id)", "cnt").
		Join("role", "b", rdbmstool.LeftJoin, "a.role_id = b.id").
		Join("access", "c", rdbmstool.LeftJoin, "a.access_id = c.id")

	if strings.Compare(keyword, "") != 0 {
		sqlQuery.WhereAddOr("b.name LIKE '%" + keyword + "%'").
			WhereAddOr("c.name LIKE '%" + keyword + "%'")
	}

	if strings.Compare(accessIDFilter, "") != 0 {
		sqlQuery.WhereAddAnd("a.access_id = '" + accessIDFilter + "'")
	}

	if strings.Compare(roleIDFilter, "") != 0 {
		sqlQuery.WhereAddAnd("a.role_id = '" + roleIDFilter + "'")
	}

	sqlStr, sqlErr := sqlQuery.SQL()
	if sqlErr != nil {
		return 0, sqlErr
	}

	rows, dbErr = db.Query(sqlStr)
	if dbErr != nil {
		return 0, dbErr
	}

	var tmp int
	for rows.Next() {

		if err := rows.Scan(&tmp); err != nil {
			rows.Close()
			return 0, err
		}

		rows.Close()
	}

	return tmp, nil
}
