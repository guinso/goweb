package authentication

import "time"

const (
	//AnonymousID anonymous user ID
	AnonymousID = 0
	cookieKey   = "gorilla-goweb"
)

//LoginStatus login status
type LoginStatus uint8

const (
	//LoggedIn login success
	LoggedIn LoginStatus = iota
	//LoginFailed failed to login (incorrect username or password)
	LoginFailed
	//LoggedOut logged out
	LoggedOut
)

//LoginRequest login request information
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"pwd"`
}

//AuthService authentication service
type AuthService interface {
	Login(request *LoginRequest) (LoginStatus, string, error)
	Logout(loginToken string) error
	GetCurrentLoginAccount(loginToken string) (*AccountInfo, error)
}

//LoginSession login session store at database
type LoginSession struct {
	ID        string
	AccountID string
	HashKey   string
	Login     time.Time
	Logout    time.Time //need to verify is zero time
	LastSeen  time.Time
}

//IsStillActive get status weather login session is active or not
func (session *LoginSession) IsStillActive() bool {
	return session.Logout.IsZero()
}
