package authentication

import (
	"strings"
	"testing"

	"github.com/guinso/goweb/server"
)

func TestAddAccount(t *testing.T) {
	db := server.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = AddAccount(trx, "koko", "123456789")
	if err != nil {
		t.Error(err.Error())
	}

	err = AddAccount(trx, "dick", "123456789")
	if err == nil {
		t.Error("Duplicate account 'dick' should be triggered")
	}

	trx.Rollback() //rollback transaction no need create new record
}

func TestChangeAccountPassword(t *testing.T) {
	db := server.GetTestDB()
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
	db := server.GetTestDB()

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
	db := server.GetTestDB()

	//TODO: replace this hardcorded user ID from database
	account, err := GetAccountByID(db, "220c86dd0f5ad6322a4e2d94a7d925cf")
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

func TestGetAccount(t *testing.T) {
	db := server.GetTestDB()

	accs, accErr := GetAccount(db, AccountSearchParam{
		PageSize:  10,
		PageIndex: 0,
		Keyword:   "dick",
	})

	if accErr != nil {
		t.Error(accErr)
		return
	}

	if len(accs) != 1 {
		t.Errorf("Expect return one record (dick), but get %d instead", len(accs))
	}
}
