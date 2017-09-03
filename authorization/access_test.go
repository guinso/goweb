package authorization

import (
	"strings"
	"testing"

	"github.com/guinso/goweb/util"
)

func TestAddAccessGroup(t *testing.T) {
	db := util.GetTestDB()
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
	db := util.GetTestDB()
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
	if grpErr == nil {
		t.Error("koringa is not existed in database but no error being throw")
	}

	trx.Rollback() //no need to commit changes
}

func TestAddAccess(t *testing.T) {
	db := util.GetTestDB()
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
	db := util.GetTestDB()
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
	if accessErr == nil {
		t.Error("System should return error as <delete account> is not exists in database")
	}

	trx.Rollback() //no need to commit changes
}
