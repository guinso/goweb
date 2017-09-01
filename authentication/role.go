package authentication

import "github.com/guinso/rdbmstool"

func getRolesByAccountID(db rdbmstool.DbHandlerProxy, accountID string) ([]string, error) {
	SQL := "SELECT role_id FROM account_role WHERE account_id = ?"

	rows, err := db.Query(SQL, accountID)
	if err != nil {
		return nil, err
	}

	result := []string{}
	for rows.Next() {
		var tmpStr string
		if err = rows.Scan(&tmpStr); err != nil {
			rows.Close()
			return nil, err
		}

		result = append(result, tmpStr)
	}

	rows.Close()

	return result, nil
}
