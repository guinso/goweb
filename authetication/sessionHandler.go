package authetication

const (
	//AnonymousID anonymous user ID
	AnonymousID = 0
)

//Login try register user to login session if
//1. username and password matched
//2. no one is login
func Login(username, password string) (bool, error) {
	return false, nil
}

//Logout try end user login session
func Logout(username string) (bool, error) {
	return false, nil
}

//GetCurrentUser return current session's user ID
//return 0 if it is anonymous user
func GetCurrentUser() int {
	return AnonymousID
}
