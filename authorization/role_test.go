package authorization

import (
	"database/sql"
	"fmt"
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
	} else if len(roleID) == 0 {
		t.Error("Role manager should exists in database")
	}

	//test non-exists role
	roleID, err = GetRoleIDByName(db, "supervisor")
	if err != nil {
		t.Error(err)
	} else if len(roleID) > 0 {
		t.Error("Non exists role 'supervisor' should return empty string, but get " + roleID)
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

	err = addAccRoleXXX(trx, "jojo", "user")
	if err == nil {
		t.Error("non exists user 'Jojo' should failed to add account role")
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
	} else if accInfo == nil {
		return fmt.Errorf("Account '%s' not found in database", username)
	}

	return AddAccountRole(trx, accInfo.AccountID, roleName)
}

func TestUpdateRole(t *testing.T) {
	db := util.GetTestDB()

	trx, err := db.Begin()
	if err != nil {
		t.Fatal(err)
	}

	err = UpdateRole(trx, "manager", "managerJJ")
	if err != nil {
		t.Error(err)
	}
	trx.Rollback()

	trx, err = db.Begin()
	if err != nil {
		t.Fatal(err)
	}
	err = UpdateRole(trx, "manager-not-exist", "abc")
	if err == nil {
		t.Error("manager-not-exist shouldn't allow to update as it is not existed")
	}
	trx.Rollback()
}
