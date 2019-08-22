package authorization

import (
	"testing"

	"localsrc/authentication"
	"localsrc/server"
)

func TestIsAuthorize(t *testing.T) {
	db := server.GetTestDB()

	accInfo, err := authentication.GetAccountByName(db, "dick")
	if err != nil {
		t.Error(err)
	} else if accInfo == nil {
		t.Error("Account 'dick' should exists in database")
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
	db := server.GetTestDB()
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

func TestGetRoleAccess(t *testing.T) {
	db := server.GetTestDB()

	roles, err := GetAccessRole(db, "", "", "", 10, 0)
	if err != nil {
		t.Fatal(err)
	}

	if len(roles) != 9 {
		t.Errorf("Expect to get 9 access role records but get %d instead", len(roles))
	}

	//test filter
	roles, err = GetAccessRole(db, "manager", "", "", 10, 0)
	if err != nil {
		t.Fatal(err)
	}

	if len(roles) != 3 {
		t.Errorf("Expect to get 3 access role records for manager but get %d instead", len(roles))
	}
}

func TestGetRoleAccessCount(t *testing.T) {
	db := server.GetTestDB()

	cnt, err := GetAccessRoleCount(db, "", "", "")
	if err != nil {
		t.Fatal(err)
	}

	if cnt != 9 {
		t.Errorf("Expect to get 9 access role rec                                                                                                                                                                                                                                                                                            ords but get %d instead", cnt)
	}

	//test filter
	cnt, err = GetAccessRoleCount(db, "manager", "", "")
	if err != nil {
		t.Fatal(err)
	}

	if cnt != 3 {
		t.Errorf("Expect to get 3 access role records for manager but get %d instead", cnt)
	}
}
