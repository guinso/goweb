package testwebapi_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"localsrc/route"
)

func TestMeals(t *testing.T) {
	req, reqErr := http.NewRequest("GET", "/api/meals", nil)
	if reqErr != nil {
		t.Fatal(reqErr)
	}

	//you can further mock request by modifying <req> variable

	w := httptest.NewRecorder()
	route.WebHandler(w, req)

	if w.Code != 200 {
		t.Errorf("Fail to get 200 return status, got: %d", w.Code)
	}
}
