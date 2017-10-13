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

func TestGetRole(t *testing.T) {
	db := util.GetTestDB()

	roles, err := GetRole(db, "", 10, 0)
	if err != nil {
		t.Fatal(err)
	}

	if len(roles) != 3 {
		t.Errorf("Expect to have 3 records, but found %d", len(roles))
	}

	if strings.Compare(roles[0].Name, "") == 0 {
		t.Error("Expect role has name, but found empty string instead")
	}

	//test to get manager role
	manager, queryErr := GetRole(db, "manager", 10, 0)
	if queryErr != nil {
		t.Fatal(queryErr)
	}

	if len(manager) != 1 {
		t.Errorf("Expect will get one role record (manager) but get %d instead", len(manager))
	}

	if strings.Compare(manager[0].Name, "manager") != 0 {
		t.Errorf("Expect will get manager record but get %s instead", manager[0].Name)
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
