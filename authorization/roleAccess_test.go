package authorization

import (
	"testing"

	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/util"
)

func TestIsAuthorize(t *testing.T) {
	db := util.GetTestDB()

	accInfo, err := authentication.GetAccountByName(db, "dick")
	if err != nil {
		t.Error(err)
	}

	isAuthorize, authErr := IsAuthorize(db, accInfo.AccountID, "view account")
	if authErr != nil {
		t.Error(authErr)
	}
	if !isAuthorize {
		t.Error("Expect user <dick> has granted permission on <view account>")
	}

	isAuthorize, authErr = IsAuthorize(db, accInfo.AccountID, "update account")
	if authErr != nil {
		t.Error(authErr)
	}
	if isAuthorize {
		t.Error("Expect user <dick> has no permission on <update account>")
	}
}

func TestAddRoleAccess(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	if err = AddAccess(trx, "delete account", "account"); err != nil {
		t.Error(err)
	}

	if err = AddRoleAccess(trx, "manager", "delete account", false); err != nil {
		t.Error(err)
	}

	if err = AddRoleAccess(trx, "manager", "koko jeli", true); err == nil {
		t.Error("Expect add non exists <koko jeli> access will return error but it doesn't")
	}

	if err = AddRoleAccess(trx, "bobo", "delete account", false); err == nil {
		t.Error("Expect non exists <bobo> role will return error but it doesn't")
	}

	if err = AddRoleAccess(trx, "user", "view account", true); err == nil {
		t.Error("Expect add existed access role will return error but it doesn't")
	}

	trx.Rollback() //no need to commit changes
}
