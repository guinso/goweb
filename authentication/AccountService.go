package authentication

//AccountInfo account info from database
type AccountInfo struct {
	//AccountId account ID
	AccountID string `json:"id"`
	//Username username
	Username string `json:"username"`
	//SaltedPwd pasword that had been hashed
	SaltedPwd string `json:"-"`

	Roles []RoleInfo `json:"-"`
}

//AccountSearchParam search account parameter
type AccountSearchParam struct {
	PageSize  int
	PageIndex int
	Keyword   string
}

//AccountService authentication service
type AccountService interface {
	AddAccount(username, password string) error
	AddAccountRole(accountID, roleName string) error
	//UpdateAccount(account *AccountInfo) error

	ChangeAccountPassword(username, currentPassword, newPassword string) error
	GetAccountByUsername(username string) (*AccountInfo, error)
	GetAccountByID(id string) (*AccountInfo, error)
	GetAccount(searchParam *AccountSearchParam) ([]AccountInfo, error)
}
