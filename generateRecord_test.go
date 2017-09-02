package main

import (
	"database/sql"
	"testing"

	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/authorization"
)

/*
func TestGenerateRecords(t *testing.T) {
	//generate all database records
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	if err = addAccounts(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addRole(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addAccountRole(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addAccessGroup(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addAccess(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addRoleAccess(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	trx.Commit()
}
*/

func addAccounts(trx *sql.Tx, t *testing.T) error {
	//add accounts

	err := authentication.AddAccount(trx, "dick", "123456789")
	if err != nil {
		return err
	}

	err = authentication.AddAccount(trx, "mary", "1q2w3e4r")
	if err != nil {
		return err
	}

	err = authentication.AddAccount(trx, "harry", "qweasdzxc")
	if err != nil {
		return err
	}

	return nil
}

func addRole(trx *sql.Tx, t *testing.T) error {
	//add role
	if err := authorization.AddRole(trx, "user"); err != nil {
		return err
	}
	if err := authorization.AddRole(trx, "manager"); err != nil {
		return err
	}
	if err := authorization.AddRole(trx, "admin"); err != nil {
		return err
	}

	return nil
}

func addAccountRole(trx *sql.Tx, t *testing.T) error {
	if err := addAccountRoleXXX(trx, t, "dick", "user", "manager"); err != nil {
		return err
	}

	if err := addAccountRoleXXX(trx, t, "mary", "admin"); err != nil {
		return err
	}

	if err := addAccountRoleXXX(trx, t, "hary", "user"); err != nil {
		return err
	}

	return nil
}

func addAccountRoleXXX(trx *sql.Tx, t *testing.T, username string, roles ...string) error {
	userInfo, err := authentication.GetAccountByName(trx, username)
	if err != nil {
		return err
	}
	if userInfo == nil {
		return err
	}

	for _, role := range roles {
		if err = authorization.AddAccountRole(trx, userInfo.AccountID, role); err != nil {
			return err
		}
	}

	return nil
}

func addAccessGroup(trx *sql.Tx, t *testing.T) error {
	if err := authorization.AddAccessGroup(trx, "account"); err != nil {
		return err
	}

	return nil
}

func addAccess(trx *sql.Tx, t *testing.T) error {
	if err := authorization.AddAccess(trx, "view account", "account"); err != nil {
		return err
	}

	if err := authorization.AddAccess(trx, "create account", "account"); err != nil {
		return err
	}

	if err := authorization.AddAccess(trx, "update account", "account"); err != nil {
		return err
	}

	return nil
}

func addRoleAccess(trx *sql.Tx, t *testing.T) error {
	if err := authorization.AddRoleAccess(trx, "user", "view account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "user", "create account", false); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "user", "update account", false); err != nil {
		return err
	}

	if err := authorization.AddRoleAccess(trx, "manager", "view account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "manager", "create account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "manager", "update account", false); err != nil {
		return err
	}

	if err := authorization.AddRoleAccess(trx, "admin", "view account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "admin", "create account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "admin", "update account", true); err != nil {
		return err
	}

	return nil
}
