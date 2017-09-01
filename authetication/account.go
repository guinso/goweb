package authetication

import "database/sql"

//AccountInfo account info from database
type AccountInfo struct {
	//AccountId account ID
	AccountID string
	//Username username
	Username string
	//SaltedPwd pasword that had been hashed
	SaltedPwd string

	Roles []string
}

//GetAccountByName get account information by user name
func GetAccountByName(db *sql.DB, username string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE username = ?"

	row := db.QueryRow(sql, username)

	return formatAccountInfo(db, row)
}

//GetAccountByID get account information by user ID
func GetAccountByID(db *sql.DB, userID string) (*AccountInfo, error) {
	sql := "SELECT id, username, pwd FROM account WHERE id = ?"

	row := db.QueryRow(sql, userID)

	return formatAccountInfo(db, row)
}

func formatAccountInfo(db *sql.DB, row *sql.Row) (*AccountInfo, error) {
	if row != nil {
		var tmpID, tmpUsername, tmpPwd string
		if err := row.Scan(&tmpID, &tmpUsername, &tmpPwd); err != nil {
			return nil, err
		}

		//get all related roles
		roles, err := getRolesByAccountID(db, tmpID)
		if err != nil {
			return nil, err
		}

		return &AccountInfo{
			AccountID: tmpID,
			Username:  tmpUsername,
			SaltedPwd: tmpPwd,
			Roles:     roles,
		}, nil
	}

	return nil, nil
}
