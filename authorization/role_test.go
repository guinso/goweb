package authorization

import (
	"database/sql"
	"strings"
	"testing"

	"github.com/guinso/goweb/authentication"

	"github.com/guinso/goweb/util"
)

func TestAddRole(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	if err = AddRole(trx, "view sales"); err != nil {
		t.Error(err)
	}

	trx.Rollback() //no need to commit changes
}

func TestGetRoleIDByName(t *testing.T) {
	db := util.GetTestDB()

	roleID, err := GetRoleIDByName(db, "manager")
	if err != nil {
		t.Error(err)
	}

	if strings.Compare(roleID, "") == 0 {
		t.Error("Role manager should exists in database")
	}

	//test non-exists role
	roleID, err = GetRoleIDByName(db, "supervisor")
	if err == nil {
		t.Error("Non exists role 'supervisor' should return error")
	}
}

func TestAddAccountRole(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	err = addAccRoleXXX(trx, "harry", "manager")
	if err != nil {
		t.Error(err)
	}

	err = addAccRoleXXX(trx, "dick", "user")
	if err == nil {
		t.Error("user dick already have role 'user', this test should be failed")
	}

	trx.Rollback() //no need to commit changes
}

func addAccRoleXXX(trx *sql.Tx, username string, roleName string) error {
	accInfo, err := authentication.GetAccountByName(trx, username)
	if err != nil {
		return err
	}

	return AddAccountRole(trx, accInfo.AccountID, roleName)
}
