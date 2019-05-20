package server

import (
	"database/sql"
	"os"
	"testing"

	"github.com/guinso/goweb/authentication"
	"github.com/guinso/goweb/authorization"
	"github.com/guinso/goweb/util"
)

const createSQLite3DBScript = `
CREATE TABLE account(
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    pwd TEXT
);

CREATE TABLE role(
    id TEXT PRIMARY KEY,
    name TEXT
);

create TABLE account_role(
    id TEXT PRIMARY KEY,
    account_id TEXT,
    role_id TEXT,
    FOREIGN KEY (account_id) REFERENCES account (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE access_group(
    id TEXT PRIMARY KEY,
    name TEXT
);

CREATE TABLE access(
    id TEXT PRIMARY KEY,
    name TEXT,
    group_id TEXT,
    FOREIGN KEY (group_id) REFERENCES access_group (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE role_access(
    id TEXT PRIMARY KEY,
    access_id TEXT,
    role_id TEXT,
    is_authorize INTEGER,
    FOREIGN KEY (access_id) REFERENCES access (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (role_id) REFERENCES role (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE login_session(
    id TEXT PRIMARY KEY,
    account_id TEXT,
    hash_key TEXT,
    login TEXT,
    logout TEXT,
    last_seen TEXT,
    FOREIGN KEY (account_id) REFERENCES account (id)
    ON DELETE CASCADE ON UPDATE CASCADE
);`

func TestClearDatabase(t *testing.T) {
	//SQLITE3
	if util.FileExists(util.SQLiteFilePath) {
		os.Remove(util.SQLiteFilePath)
	}

	db := util.GetTestDB()
	if _, err := db.Exec(createSQLite3DBScript, nil); err != nil {
		t.Error(err)
	}

	//appliable for MYSQL
	// if err := initDbTable(db, util.TestDatabaseName); err != nil {
	// 	t.Fatalf("Failed to create tables: %s", err.Error())
	// }
}

// func dropTable(db rdbmstool.DbHandlerProxy, tableName string) error {
// 	_, err := db.Exec("DROP table ?", tableName)

// 	return err
// }

//NOTE: Remember go to util/helper.go modify GetTestDB() content
func TestGenerateRecords(t *testing.T) {
	//generate all database records
	db := util.GetTestDB()
	trx, err := db.Begin()
	if err != nil {
		t.Error(err.Error())
		return
	}

	if err = addAccounts(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addRole(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addAccountRole(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addAccessGroup(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addAccess(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	if err = addRoleAccess(trx, t); err != nil {
		trx.Rollback()
		t.Errorf(err.Error())
		return
	}

	trx.Commit()
}

func addAccounts(trx *sql.Tx, t *testing.T) error {
	//add accounts

	err := authentication.AddAccount(trx, "dick", "123456789")
	if err != nil {
		return err
	}

	err = authentication.AddAccount(trx, "mary", "1q2w3e4r")
	if err != nil {
		return err
	}

	err = authentication.AddAccount(trx, "harry", "qweasdzxc")
	if err != nil {
		return err
	}

	return nil
}

func addRole(trx *sql.Tx, t *testing.T) error {
	//add role
	if err := authorization.AddRole(trx, "user"); err != nil {
		return err
	}
	if err := authorization.AddRole(trx, "manager"); err != nil {
		return err
	}
	if err := authorization.AddRole(trx, "admin"); err != nil {
		return err
	}

	return nil
}

func addAccountRole(trx *sql.Tx, t *testing.T) error {
	if err := addAccountRoleXXX(trx, t, "dick", "user", "manager"); err != nil {
		return err
	}

	if err := addAccountRoleXXX(trx, t, "mary", "admin"); err != nil {
		return err
	}

	if err := addAccountRoleXXX(trx, t, "hary", "user"); err != nil {
		return err
	}

	return nil
}

func addAccountRoleXXX(trx *sql.Tx, t *testing.T, username string, roles ...string) error {
	userInfo, err := authentication.GetAccountByName(trx, username)
	if err != nil {
		return err
	}
	if userInfo == nil {
		return err
	}

	for _, role := range roles {
		if err = authorization.AddAccountRole(trx, userInfo.AccountID, role); err != nil {
			return err
		}
	}

	return nil
}

func addAccessGroup(trx *sql.Tx, t *testing.T) error {
	if err := authorization.AddAccessGroup(trx, "account"); err != nil {
		return err
	}

	return nil
}

func addAccess(trx *sql.Tx, t *testing.T) error {
	if err := authorization.AddAccess(trx, "view account", "account"); err != nil {
		return err
	}

	if err := authorization.AddAccess(trx, "create account", "account"); err != nil {
		return err
	}

	if err := authorization.AddAccess(trx, "update account", "account"); err != nil {
		return err
	}

	return nil
}

func addRoleAccess(trx *sql.Tx, t *testing.T) error {
	if err := authorization.AddRoleAccess(trx, "user", "view account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "user", "create account", false); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "user", "update account", false); err != nil {
		return err
	}

	if err := authorization.AddRoleAccess(trx, "manager", "view account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "manager", "create account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "manager", "update account", false); err != nil {
		return err
	}

	if err := authorization.AddRoleAccess(trx, "admin", "view account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "admin", "create account", true); err != nil {
		return err
	}
	if err := authorization.AddRoleAccess(trx, "admin", "update account", true); err != nil {
		return err
	}

	return nil
}
