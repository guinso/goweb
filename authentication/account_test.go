package authentication

import (
	"strings"
	"testing"

	"github.com/guinso/goweb/util"
)

func TestAddAccount(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = AddAccount(trx, "john", "123456789")
	if err != nil {
		t.Error(err.Error())
	}

	err = AddAccount(trx, "john", "123456789")
	if err == nil {
		t.Error("Duplicate account 'john' should be triggered")
	}

	trx.Rollback() //rollback transaction no need create new record
}

func TestChangeAccountPassword(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = ChangeAccountPassword(trx, "dick", "123456789", "1q2w3e4r")
	if err != nil {
		t.Error(err.Error())
	}

	trx.Rollback() //no need to make changes
}

func TestGetAccountByName(t *testing.T) {
	db := util.GetTestDB()

	account, err := GetAccountByName(db, "dick")
	if err != nil {
		t.Error(err.Error())
	}

	if account == nil {
		t.Error("Expect account 'Dick' found in account datatable")
	}

	//try search non-exists account
	account, err = GetAccountByName(db, "sucy")
	if err != nil {
		t.Error(err.Error())
	}

	if account != nil {
		t.Error("Account 'sucy' shouldn't be found in account datatable")
	}
}

func TestGetAccountByID(t *testing.T) {
	db := util.GetTestDB()

	//TODO: replace this hardcorded user ID from database
	account, err := GetAccountByID(db, "2bb693c569f962aeaade0453f872bbff")
	if err != nil {
		t.Error(err.Error())
	}

	if account == nil {
		t.Error("Expect account 'Dick' found in account datatable")

	} else if strings.Compare(account.Username, "dick") != 0 {
		t.Errorf("Expect account 'Dick' found in account datatable, but get %s", account.Username)
	}

	//try search non-exists account
	account, err = GetAccountByID(db, "sucy123456789")
	if err != nil {
		t.Error(err.Error())
	} else if account != nil {
		t.Error("Account 'sucy' shouldn't be found in account datatable")
	}
}
