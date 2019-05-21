package authentication

//RoleInfo role
type RoleInfo struct {
	//Id role record id
	ID string `json:"id"`
	//Name role record name
	Name string `json:"name"`
}

//RoleSearchParam search role parameter
type RoleSearchParam struct {
	PageSize  int
	PageIndex int
	Keyword   string
}

//RoleService role service
type RoleService interface {
	AddRole(name string) error
	UpdateRole(roleName string, newRoleName string) error
	GetRoleIDByName(roleName string) (string, error)
	GetRoleByName(roleName string) (*RoleInfo, error)
	GetRoleByAccountID(accountID string) ([]RoleInfo, error)
	GetRole(searchParam *RoleSearchParam) ([]RoleInfo, error)
}
