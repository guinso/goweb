package authetication

import (
	"database/sql"
	"fmt"
	"testing"
)

var dbb *sql.DB

func getTestDB() *sql.DB {
	if dbb == nil {
		dbb, _ = sql.Open("mysql", fmt.Sprintf(
			"%s:%s@tcp(%s:%d)/%s?charset=utf8",
			"root",
			"",
			"localhost",
			3306,
			"test"))
	}

	return dbb
}

func TestAddAccount(t *testing.T) {
	db := getTestDB()
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

/*
//this is sample code to generate a fair amount of account record for testing purpose
func TestAddSampleAccounts(t *testing.T) {
	db := getTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = AddAccount(trx, "dick", "123456789")
	if err != nil {
		t.Error(err.Error())
		trx.Rollback()
		return
	}

	err = AddAccount(trx, "mary", "1q2w3e4r")
	if err != nil {
		t.Error(err.Error())
		trx.Rollback()
		return
	}

	err = AddAccount(trx, "harry", "qweasdzxc")
	if err != nil {
		t.Error(err.Error())
		trx.Rollback()
		return
	}

	trx.Commit()
}
*/

func TestChangeAccountPassword(t *testing.T) {
	db := getTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = ChangeAccountPassword(trx, "dick", "123456789", "1q2w3e4r")
	if err != nil {
		t.Error(err.Error())
	}

	trx.Rollback() //non need to make changes
}
