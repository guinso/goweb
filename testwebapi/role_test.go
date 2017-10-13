package testwebapi_test

import (
	"bytes"
	"net/http"
	"testing"

	"github.com/guinso/goweb/util"
)

type role struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func TestGetRole(t *testing.T) {
	req, reqErr := http.NewRequest("GET", "http://localhost:7777/api/role", nil)
	if reqErr != nil {
		t.Fatal(reqErr)
	}

	roles := []role{}

	msg, _, err := util.RestRequestForTest(req, &roles)
	if err != nil {
		t.Fatal(err)
	}

	if msg.StatusCode != 0 {
		t.Errorf("Fail to get role records, status code: %d", msg.StatusCode)
	}
}

func TestAddRole(t *testing.T) {

	req, reqErr := http.NewRequest(
		"POST",
		"http://localhost:7777/api/role",
		bytes.NewBufferString(`{"name":"reporter"}`))

	if reqErr != nil {
		t.Fatal(reqErr)
	}

	gg := struct{ name string }{name: ""}

	msg, _, err := util.RestRequestForTest(req, &gg)
	if err != nil {
		t.Fatal(err)
	}

	if msg.StatusCode != 0 {
		t.Error("Fail to add role")
	}
}
