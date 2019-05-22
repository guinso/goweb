package authorization

//RoleAccess access description for related role
type RoleAccess struct {
	ID          string `json:"id"`
	Role        string `json:"role"`
	RoleID      string `json:"roleID"`
	Access      string `json:"access"`
	AccessID    string `json:"accessID"`
	IsAuthorize bool   `json:"isAuthorize"`
}

//RoleAccessSearchParam role access search parameter
type RoleAccessSearchParam struct {
	Keyword   string
	PageIndex int
	PageSize  int
	AccessID  string
	RoleID    string
}

//RoleAccessService role access service handler
type RoleAccessService interface {
	IsAuthorize(accountID, accessName string) (bool, error)
	AddRoleAccess(roleName string, accessName string, isAuthorize bool) error

	UpdateRoleAccessAuthorization(roleName, accessName string, isAuthorize bool) error
	GetAccessRole(searchParam *RoleAccessSearchParam) ([]RoleAccess, error)
	GetAccessRoleCount(searchParam *RoleAccessSearchParam) (int, error)
}
