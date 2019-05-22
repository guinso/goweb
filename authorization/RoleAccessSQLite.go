package authorization

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/guinso/goweb/authentication"

	"github.com/guinso/goweb/server"
	"github.com/guinso/rdbmstool"
)

//RoleAccessSQLite role access service SQLite storage
type RoleAccessSQLite struct {
	DBProxy server.GetDBProxy
	Server  server.WebServer
	Role    *authentication.RoleSQLite
	Access  *AccessSQLite
}

//NewRoleAccessSQLite initialize a new instance of  RoleAccess SQLite service
func NewRoleAccessSQLite(serverParam server.WebServer, getDBProxyFn server.GetDBProxy) *RoleAccessSQLite {
	roleAccess := &RoleAccessSQLite{
		DBProxy: getDBProxyFn,
		Server:  serverParam}

	roleAccess.Role = authentication.NewRoleSQLite(serverParam, getDBProxyFn)
	roleAccess.Access = NewAccessSQLite(serverParam, getDBProxyFn)

	return roleAccess
}

//IsAuthorize check provided user is eligible to access specified subject
func (roleAccess *RoleAccessSQLite) IsAuthorize(accountID, accessName string) (bool, error) {
	sql := "SELECT id FROM access WHERE name = ?"

	rows, err := roleAccess.DBProxy().Query(sql, accessName)
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

	return roleAccess.isAuthorizeByID(accountID, accessID)
}

//isAuthorize check provided user is eligible to access specified subject
func (roleAccess *RoleAccessSQLite) isAuthorizeByID(accountID string, accessID string) (bool, error) {

	SQL := "SELECT SUM(a.is_authorize) FROM role_access a " +
		"INNER JOIN account_role b ON a.role_id = b.role_id " +
		"WHERE b.account_id = ? AND a.access_id = ?"

	rows, queryErr := roleAccess.DBProxy().Query(SQL, accountID, accessID)
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
func (roleAccess *RoleAccessSQLite) AddRoleAccess(roleName, accessName string, isAuthorize bool) error {
	roleID, roleErr := roleAccess.Role.GetRoleIDByName(roleName)
	if roleErr != nil {
		return roleErr
	} else if len(roleID) == 0 {
		return fmt.Errorf("Role '%s' not exists in database", roleName)
	}

	accessID, accessErr := roleAccess.Access.GetAccessIDByName(accessName)
	if accessErr != nil {
		return accessErr
	} else if len(accessID) == 0 {
		return fmt.Errorf("Access '%s' not exists in database", accessName)
	}

	rows, rErr := roleAccess.DBProxy().Query("SELECT * FROM role_access WHERE role_id = ? AND access_id = ?", roleID, accessID)
	if rErr != nil {
		return rErr
	}
	defer rows.Close()
	count := 0
	for rows.Next() {
		count++
	}
	if count > 0 {
		return fmt.Errorf("Role Access '%s'(role), '%s'(access) already exists in database", roleName, accessName)
	}

	authValue := 0
	if isAuthorize {
		authValue = 1
	}

	_, err := roleAccess.DBProxy().Exec("INSERT INTO role_access (id, access_id, role_id, is_authorize) VALUES (?, ?, ?, ?)",
		roleAccess.Server.GetRandomRunningNumber("role_access"),
		accessID,
		roleID,
		authValue)

	return err
}

//UpdateRoleAccessAuthorization update role access authorization
func (roleAccess *RoleAccessSQLite) UpdateRoleAccessAuthorization(roleName, accessName string, isAuthorize bool) error {

	roleID, roleErr := roleAccess.Role.GetRoleIDByName(roleName)
	if roleErr != nil {
		return roleErr
	}

	accessID, accessErr := roleAccess.Access.GetAccessIDByName(accessName)
	if accessErr != nil {
		return accessErr
	}

	authValue := 0
	if isAuthorize {
		authValue = 1
	}

	_, err := roleAccess.DBProxy().Exec("UPDATE role_access is_authorize = ? WHERE access_id = ? AND role_id = ?)",
		roleAccess.Server.GetRandomRunningNumber("role_access"),
		authValue,
		accessID,
		roleID)

	return err
}

//GetAccessRole get access role records
func (roleAccess *RoleAccessSQLite) GetAccessRole(searchParam *RoleAccessSearchParam) ([]RoleAccess, error) {
	var rows *sql.Rows
	var dbErr error

	sqlQuery := rdbmstool.NewQueryBuilder()
	sqlQuery.From("role_access", "").
		Select("role_access.id", "").
		Select("role_access.role_id", "").
		Select("role_access.access_id", "").
		Select("role.name", "role").
		Select("access.name", "access").
		Select("role_access.is_authorize", "").
		JoinAdd("role", "", rdbmstool.LeftJoin, "role_access.role_id = role.id").
		JoinAdd("access", "", rdbmstool.LeftJoin, "role_access.access_id = access.id").
		Limit(searchParam.PageSize, searchParam.PageIndex)

	if strings.Compare(searchParam.Keyword, "") != 0 {
		sqlQuery.WhereAddOr("role.name LIKE '%" + searchParam.Keyword + "%'").
			WhereAddOr("access.name LIKE '%" + searchParam.Keyword + "%'")
	}

	if strings.Compare(searchParam.AccessID, "") != 0 {
		sqlQuery.WhereAddAnd("role_access.access_id = '" + searchParam.AccessID + "'")
	}

	if strings.Compare(searchParam.RoleID, "") != 0 {
		sqlQuery.WhereAddAnd("role_access.role_id = '" + searchParam.RoleID + "'")
	}

	sqlStr, sqlErr := sqlQuery.SQL()
	if sqlErr != nil {
		return nil, sqlErr
	}

	rows, dbErr = roleAccess.DBProxy().Query(sqlStr)
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
func (roleAccess *RoleAccessSQLite) GetAccessRoleCount(searchParam *RoleAccessSearchParam) (int, error) {
	var rows *sql.Rows
	var dbErr error

	sqlQuery := rdbmstool.NewQueryBuilder()
	sqlQuery.From("role_access", "").
		Select("COUNT(role_access.id)", "cnt").
		JoinAdd("role", "", rdbmstool.LeftJoin, "role_access.role_id = role.id").
		JoinAdd("access", "", rdbmstool.LeftJoin, "role_access.access_id = access.id")

	if strings.Compare(searchParam.Keyword, "") != 0 {
		sqlQuery.WhereAddOr("role.name LIKE '%" + searchParam.Keyword + "%'").
			WhereAddOr("access.name LIKE '%" + searchParam.Keyword + "%'")
	}

	if strings.Compare(searchParam.AccessID, "") != 0 {
		sqlQuery.WhereAddAnd("role_access.access_id = '" + searchParam.AccessID + "'")
	}

	if strings.Compare(searchParam.RoleID, "") != 0 {
		sqlQuery.WhereAddAnd("role_access.role_id = '" + searchParam.RoleID + "'")
	}

	sqlStr, sqlErr := sqlQuery.SQL()
	if sqlErr != nil {
		return 0, sqlErr
	}

	rows, dbErr = roleAccess.DBProxy().Query(sqlStr)
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
