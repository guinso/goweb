package authorization

import (
	"strings"
	"testing"

	"github.com/guinso/goweb/server"
)

func TestAddAccessGroup(t *testing.T) {
	db := server.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = AddAccessGroup(trx, "hr")
	if err != nil {
		t.Error(err)
	}

	err = AddAccessGroup(trx, "account")
	if err == nil {
		t.Error("system should reject create access group 'account' as it already created")
	}

	trx.Rollback() //no need to commit changes
}

func TestGetAccessGroupIDByName(t *testing.T) {
	db := server.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	groupID, grpErr := GetAccessGroupIDByName(trx, "account")
	if grpErr != nil {
		t.Error(grpErr)
	}
	if strings.Compare(groupID, "") == 0 {
		t.Error("account should found in access_group data table")
	}

	groupID, grpErr = GetAccessGroupIDByName(trx, "koringa")
	if grpErr != nil {
		t.Error(grpErr)
	} else if len(groupID) > 0 {
		t.Error("Group Access 'koringa' shouldn't exist in database")
	}

	trx.Rollback() //no need to commit changes
}

func TestAddAccess(t *testing.T) {
	db := server.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = AddAccess(trx, "delete account", "account")
	if err != nil {
		t.Error(err)
	}

	err = AddAccess(trx, "view account", "account")
	if err == nil {
		t.Error("<view account> should be prohibited from adding into database as it already exists")
	}

	err = AddAccess(trx, "view koko", "gogo")
	if err == nil {
		t.Error("System should return error as access group <gogo> is not exists in database")
	}

	trx.Rollback() //no need to commit changes
}

func TestGetAccessIDByName(t *testing.T) {
	db := server.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	accessID, accessErr := GetAccessIDByName(trx, "view account")
	if accessErr != nil {
		t.Error(accessErr)
	}

	if strings.Compare(accessID, "") == 0 {
		t.Error("access <view account> should have ID but get empty string")
	}

	accessID, accessErr = GetAccessIDByName(trx, "delete account")
	if accessErr != nil {
		t.Error(accessErr)
	} else if len(accessID) > 0 {
		t.Error("Access 'delete account' should not exists in database")
	}

	trx.Rollback() //no need to commit changes
}

func TestGetAccess(t *testing.T) {
	db := server.GetTestDB()

	items, err := GetAccess(db, "", 10, 0)
	if err != nil {
		t.Error(err.Error())
		return
	}
	if len(items) < 1 {
		t.Errorf("Expect access record has more than 1 record but get zero")
	}

	items, err = GetAccess(db, "", 3, 0)
	if err != nil {
		t.Error(err.Error())
		return
	}
	if len(items) != 3 {
		t.Errorf("Expect get 3 records, but get %d instead", len(items))
	}
}
