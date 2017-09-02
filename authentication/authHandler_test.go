package authentication

import (
	"strings"
	"testing"

	"github.com/guinso/goweb/util"
)

func TestLogin(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
	}

	isLoginSuccess, hashKey, err := Login(trx, "dick", "123456789")
	if err != nil {
		t.Error(err.Error())

	} else if !isLoginSuccess {
		t.Error("User 'Dick' failed to login")

	} else if strings.Compare(hashKey, "") == 0 {
		t.Error("Hash key should have value but get empty string instead")

	}

	trx.Rollback() //no need to apply changes
}

func TestLogout(t *testing.T) {
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
	}

	isLoginSuccess, hashKey, err := Login(trx, "dick", "123456789")
	if err != nil {
		t.Error(err.Error())

	} else if !isLoginSuccess {
		t.Error("User 'Dick' failed to login")

	} else if strings.Compare(hashKey, "") == 0 {
		t.Error("Hash key should have value but get empty string instead")

	}

	//try test logout...
	logoutStatus, logoutErr := Logout(trx, hashKey)
	if logoutErr != nil {
		t.Error(logoutErr.Error())
	} else if !logoutStatus {
		t.Error("Failed to logout")
	}

	trx.Rollback() //no need to apply changes
}
