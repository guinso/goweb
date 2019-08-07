package authorization

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/guinso/goweb/server"
)

//AccessSQLite access service with SQLite storage
type AccessSQLite struct {
	DBProxy server.GetDBProxy
	Server  server.WebService
}

//NewAccessSQLite initialize a new instance of  Access SQLite service
func NewAccessSQLite(serverParam server.WebService, getDBProxyFn server.GetDBProxy) *AccessSQLite {
	return &AccessSQLite{
		DBProxy: getDBProxyFn,
		Server:  serverParam}
}

//AddAccessGroup insert access group record into database
func (access *AccessSQLite) AddAccessGroup(groupName string) error {
	accessGroupID, gErr := access.GetAccessGroupIDByName(groupName)
	if gErr != nil {
		return gErr
	} else if len(accessGroupID) > 0 {
		return fmt.Errorf("Access Group '%s' already exists", groupName)
	}

	SQL := "INSERT INTO access_group (id, name) VALUES (?, ?)"

	_, err := access.DBProxy().Exec(SQL, access.Server.GetRandomRunningNumber("access_group"), groupName)

	return err
}

//GetAccessGroupIDByName get access group ID by access group name
func (access *AccessSQLite) GetAccessGroupIDByName(groupName string) (string, error) {
	rows, err := access.DBProxy().Query("SELECT id FROM access_group WHERE name = ?", groupName)
	if err != nil {
		return "", err
	}

	count := 0
	groupID := ""
	for rows.Next() {
		var tmpID string
		if err = rows.Scan(&tmpID); err != nil {
			rows.Close()
			return "", err
		}

		groupID = tmpID
		count++
	}
	rows.Close()

	if count > 1 {
		return "", fmt.Errorf("Access group <%s> has more than one, found %d", groupName, count)
	}

	//if count == 0 {
	//	return "", fmt.Errorf("Access Group <%s> not found in database", groupName)
	//}

	return groupID, nil
}

//AddAccess add access record into database
func (access *AccessSQLite) AddAccess(accessName, groupName string) error {
	groupID, err := access.GetAccessGroupIDByName(groupName)
	if err != nil {
		return err
	} else if len(groupID) == 0 {
		return fmt.Errorf("Access Group '%s' not found in database", groupName)
	}

	accessID, err := access.GetAccessIDByName(accessName)
	if err != nil {
		return err
	} else if len(accessID) > 0 {
		return fmt.Errorf("Access '%s' already exists", accessName)
	}

	_, err = access.DBProxy().Exec("INSERT  INTO access (id, name, group_id) VALUES (?, ?, ?)",
		access.Server.GetRandomRunningNumber("access"),
		accessName,
		groupID)

	return err
}

//GetAccessIDByName get access ID by providing access name
func (access *AccessSQLite) GetAccessIDByName(accessName string) (string, error) {
	rows, err := access.DBProxy().Query("SELECT id FROM access WHERE name = ?", accessName)
	if err != nil {
		return "", nil
	}

	count := 0
	accessID := ""

	for rows.Next() {
		var tmpID string
		if err = rows.Scan(&tmpID); err != nil {
			rows.Close()
			return "", err
		}

		accessID = tmpID
		count++
	}
	rows.Close()

	if count > 1 {
		return "", fmt.Errorf(
			"Access <%s> record should occur not more than one, but found %d",
			accessID, count)
	}

	// if count == 0 {
	// 	return "", fmt.Errorf("Access <%s> not found in database", accessName)
	// }

	return accessID, nil
}

//GetAccess get access record(s)
func (access *AccessSQLite) GetAccess(searchParam *AccessSearchParam) ([]Access, error) {
	var rows *sql.Rows
	var dbErr error
	if strings.Compare(searchParam.Keyword, "") == 0 {
		rows, dbErr = access.DBProxy().Query("SELECT id, name FROM access LIMIT ? OFFSET ?",
			searchParam.PageSize, searchParam.PageIndex*searchParam.PageSize)
	} else {
		rows, dbErr = access.DBProxy().Query("SELECT id, name FROM access WHERE name LIKE ? LIMIT ? OFFSET ?",
			"%"+searchParam.Keyword+"%", searchParam.PageSize, searchParam.PageIndex*searchParam.PageSize)
	}

	if dbErr != nil {
		return nil, dbErr
	}

	result := []Access{}
	for rows.Next() {
		tmp := Access{}

		if scanErr := rows.Scan(&tmp.ID, &tmp.Name); scanErr != nil {
			rows.Close()
			return nil, scanErr
		}

		result = append(result, tmp)
	}
	rows.Close()

	return result, nil
}
