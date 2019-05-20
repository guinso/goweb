package authorization

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/guinso/goweb/server"
	"github.com/guinso/rdbmstool"
)

//Access access record
type Access struct {
	//Id access record id
	ID string `json:"id"`
	//Name access record name
	Name string `json:"name"`
}

//AddAccessGroup insert access group record into database
func AddAccessGroup(db rdbmstool.DbHandlerProxy, groupName string) error {
	accessGroupID, gErr := GetAccessGroupIDByName(db, groupName)
	if gErr != nil {
		return gErr
	} else if len(accessGroupID) > 0 {
		return fmt.Errorf("Access Group '%s' already exists", groupName)
	}

	SQL := "INSERT INTO access_group (id, name) VALUES (?, ?)"

	_, err := db.Exec(SQL, server.GetRandomRunningNumber("access_group"), groupName)

	return err
}

//GetAccessGroupIDByName get access group ID by access group name
func GetAccessGroupIDByName(db rdbmstool.DbHandlerProxy, groupName string) (string, error) {
	rows, err := db.Query("SELECT id FROM access_group WHERE name = ?", groupName)
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
func AddAccess(db rdbmstool.DbHandlerProxy, accessName, groupName string) error {
	groupID, err := GetAccessGroupIDByName(db, groupName)
	if err != nil {
		return err
	} else if len(groupID) == 0 {
		return fmt.Errorf("Access Group '%s' not found in database", groupName)
	}

	accessID, err := GetAccessIDByName(db, accessName)
	if err != nil {
		return err
	} else if len(accessID) > 0 {
		return fmt.Errorf("Access '%s' already exists", accessName)
	}

	_, err = db.Exec("INSERT  INTO access (id, name, group_id) VALUES (?, ?, ?)",
		server.GetRandomRunningNumber("access"),
		accessName,
		groupID)

	return err
}

//GetAccessIDByName get access ID by providing access name
func GetAccessIDByName(db rdbmstool.DbHandlerProxy, accessName string) (string, error) {
	rows, err := db.Query("SELECT id FROM access WHERE name = ?", accessName)
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
func GetAccess(db rdbmstool.DbHandlerProxy, keyword string, pageSize int, pageIndex int) ([]Access, error) {
	var rows *sql.Rows
	var dbErr error
	if strings.Compare(keyword, "") == 0 {
		rows, dbErr = db.Query("SELECT id, name FROM access LIMIT ? OFFSET ?",
			pageSize, pageIndex*pageSize)
	} else {
		rows, dbErr = db.Query("SELECT id, name FROM access WHERE name LIKE ? LIMIT ? OFFSET ?",
			"%"+keyword+"%", pageSize, pageIndex*pageSize)
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
