package testwebapi_test

//These tests is an actual test on web server, which connect to database and physical files
//to run these tests (web API test), please run web server first

import (
	"bytes"
	"net/http"
	"testing"

	"github.com/guinso/goweb/util"
)

type dummy struct {
	Jojo string `json:"jojo"`
}

func TestLoginLogout(t *testing.T) {
	dummyObj := dummy{}

	//login
	loginReq, reqErr := http.NewRequest(
		"POST",
		"http://localhost:7777/api/login",
		bytes.NewBufferString(`{"username":"dick", "pwd":"123456789"}`))
	if reqErr != nil {
		t.Fatal(reqErr)
	}
	loginMsg, loginRawResponse, loginErr := util.RestRequestForTest(
		loginReq,
		&dummyObj)
	if loginErr != nil {
		t.Fatal(loginErr)
	}

	if loginMsg.StatusCode != 0 {
		t.Fatalf("Fail to login, status code: %d, message: %s",
			loginMsg.StatusCode, loginMsg.StatusMessage)
	}

	//logout
	logoutReq, err := http.NewRequest("POST", "http://localhost:7777/api/logout", nil)
	if err != nil {
		t.Fatal(err)
	}
	for _, cookie := range loginRawResponse.Cookies() {
		logoutReq.AddCookie(cookie) //assign authentication token
	}
	logoutMsg, _, logoutErr := util.RestRequestForTest(logoutReq, &dummyObj)
	if logoutErr != nil {
		t.Fatal(logoutErr)
	}

	if logoutMsg.StatusCode != 0 {
		t.Fatalf("Fail to logout, status code: %d, message: %s",
			logoutMsg.StatusCode, logoutMsg.StatusMessage)
	}
}
