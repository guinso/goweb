package authorization

//Access access record
type Access struct {
	//Id access record id
	ID string `json:"id"`
	//Name access record name
	Name string `json:"name"`
}

//AccessSearchParam access search parameter
type AccessSearchParam struct {
	Keyword   string
	PageSize  int
	PageIndex int
}

//AccessService access service handler
type AccessService interface {
	AddAccess(accessName, groupName string)

	GetAccessIDByName(accessName string) (string, error)
	GetAccess(searchParam *AccessSearchParam) ([]Access, error)

	AddAccessGroup(groupName string) error
	GetAccessGroupIDByName(groupName string) (string, error)
}
