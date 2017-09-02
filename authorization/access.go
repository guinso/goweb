package authorization

import (
	"fmt"

	"github.com/guinso/goweb/util"
	"github.com/guinso/rdbmstool"
)

//AddAccessGroup insert access group record into database
func AddAccessGroup(db rdbmstool.DbHandlerProxy, groupName string) error {
	SQL := "INSERT INTO access_group (id, name) VALUES (?, ?)"

	_, err := db.Exec(SQL, util.GetRandomRunningNumber("access_group"), groupName)

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

	if count == 0 {
		return "", fmt.Errorf("Access Group <%s> not found in database", groupName)
	}

	return groupID, nil
}

//AddAccess add access record into database
func AddAccess(db rdbmstool.DbHandlerProxy, accessName, groupName string) error {
	groupID, err := GetAccessGroupIDByName(db, groupName)
	if err != nil {
		return err
	}

	_, err = db.Exec("INSERT  INTO access (id, name, group_id) VALUES (?, ?, ?)",
		util.GetRandomRunningNumber("access"),
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

	if count == 0 {
		return "", fmt.Errorf("Access <%s> not found in database", accessName)
	}

	return accessID, nil
}
