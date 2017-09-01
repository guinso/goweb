package authetication

import "database/sql"

func getRolesByAccountID(db *sql.DB, accountID string) ([]string, error) {
	SQL := "SELECT role_id FROM account_role WHERE account_id = ?"

	rows, err := db.Query(SQL, accountID)
	if err != nil {
		return nil, err
	}

	result := []string{}
	for rows.Next() {
		var tmpStr string
		if err = rows.Scan(&tmpStr); err != nil {
			return nil, err
		}

		result = append(result, tmpStr)
	}

	return result, nil
}
