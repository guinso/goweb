package main

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/guinso/rdbmstool"
	"github.com/guinso/rdbmstool/metaquery/mysql"
)

func initDbTable(db *sql.DB, dbName string) error {
	if err := validateAccountTable(db, dbName); err != nil {
		return err
	}

	if err := validateRoleTable(db, dbName); err != nil {
		return err
	}
	if err := validateAccountRoleTable(db, dbName); err != nil {
		return err
	}

	if err := validateAccessGroupTable(db, dbName); err != nil {
		return err
	}
	if err := validateAccessTable(db, dbName); err != nil {
		return err
	}

	if err := validateRoleAccessTable(db, dbName); err != nil {
		return err
	}

	if err := validateLoginSessionTable(db, dbName); err != nil {
		return err
	}

	return nil
}

func validateLoginSessionTable(db *sql.DB, dbName string) error {
	def := rdbmstool.TableDefinition{
		Name:        "login_session",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys:  []rdbmstool.UniqueKeyDefinition{},
		Indices:     []rdbmstool.IndexKeyDefinition{},
	}

	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "account_id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "hash_key",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "login",
		DataType:         rdbmstool.DATETIME,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "logout",
		DataType:         rdbmstool.DATETIME,
		Length:           100,
		IsNullable:       true,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "last_seen",
		DataType:         rdbmstool.DATETIME,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})

	def.Indices = append(def.Indices, rdbmstool.IndexKeyDefinition{
		ColumnNames: []string{"account_id"},
	})

	def.ForiegnKeys = append(def.ForiegnKeys, rdbmstool.ForeignKeyDefinition{
		ReferenceTableName: "account",
		Columns: []rdbmstool.FKColumnDefinition{
			rdbmstool.FKColumnDefinition{
				ColumnName:    "account_id",
				RefColumnName: "id",
			},
		},
	})

	if err := validateTable(db, dbName, &def); err != nil {
		return fmt.Errorf("Failed on validate %s db table: %s", def.Name, err.Error())
	}

	return nil
}

func validateRoleAccessTable(db *sql.DB, dbName string) error {
	def := rdbmstool.TableDefinition{
		Name:        "role_access",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys:  []rdbmstool.UniqueKeyDefinition{},
		Indices:     []rdbmstool.IndexKeyDefinition{},
	}

	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "access_id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "role_id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "is_authorize",
		DataType:         rdbmstool.BOOLEAN,
		Length:           1,
		IsNullable:       false,
		DecimalPrecision: 0,
	})

	def.Indices = append(def.Indices, rdbmstool.IndexKeyDefinition{
		ColumnNames: []string{"access_id"},
	})
	def.Indices = append(def.Indices, rdbmstool.IndexKeyDefinition{
		ColumnNames: []string{"role_id"},
	})

	def.ForiegnKeys = append(def.ForiegnKeys, rdbmstool.ForeignKeyDefinition{
		ReferenceTableName: "access",
		Columns: []rdbmstool.FKColumnDefinition{
			rdbmstool.FKColumnDefinition{
				ColumnName:    "access_id",
				RefColumnName: "id",
			},
		},
	})
	def.ForiegnKeys = append(def.ForiegnKeys, rdbmstool.ForeignKeyDefinition{
		ReferenceTableName: "role",
		Columns: []rdbmstool.FKColumnDefinition{
			rdbmstool.FKColumnDefinition{
				ColumnName:    "role_id",
				RefColumnName: "id",
			},
		},
	})

	if err := validateTable(db, dbName, &def); err != nil {
		return fmt.Errorf("Failed on validate %s db table: %s", def.Name, err.Error())
	}

	return nil
}

func validateAccessTable(db *sql.DB, dbName string) error {
	def := rdbmstool.TableDefinition{
		Name:        "access",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys:  []rdbmstool.UniqueKeyDefinition{},
		Indices:     []rdbmstool.IndexKeyDefinition{},
	}

	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "name",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "group_id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})

	def.Indices = append(def.Indices, rdbmstool.IndexKeyDefinition{
		ColumnNames: []string{"group_id"},
	})

	def.ForiegnKeys = append(def.ForiegnKeys, rdbmstool.ForeignKeyDefinition{
		ReferenceTableName: "access_group",
		Columns: []rdbmstool.FKColumnDefinition{
			rdbmstool.FKColumnDefinition{
				ColumnName:    "group_id",
				RefColumnName: "id",
			},
		},
	})

	if err := validateTable(db, dbName, &def); err != nil {
		return fmt.Errorf("Failed on validate %s db table: %s", def.Name, err.Error())
	}

	return nil
}

func validateAccessGroupTable(db *sql.DB, dbName string) error {
	def := rdbmstool.TableDefinition{
		Name:        "access_group",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys:  []rdbmstool.UniqueKeyDefinition{},
		Indices:     []rdbmstool.IndexKeyDefinition{},
	}

	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "name",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})

	if err := validateTable(db, dbName, &def); err != nil {
		return fmt.Errorf("Failed on validate %s db table: %s", def.Name, err.Error())
	}

	return nil
}

func validateAccountRoleTable(db *sql.DB, dbName string) error {
	def := rdbmstool.TableDefinition{
		Name:        "account_role",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys: []rdbmstool.UniqueKeyDefinition{
			rdbmstool.UniqueKeyDefinition{
				ColumnNames: []string{"account_id", "role_id"},
			},
		},
		Indices: []rdbmstool.IndexKeyDefinition{},
	}

	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "account_id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "role_id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})

	def.Indices = append(def.Indices, rdbmstool.IndexKeyDefinition{
		ColumnNames: []string{"account_id"},
	})
	def.Indices = append(def.Indices, rdbmstool.IndexKeyDefinition{
		ColumnNames: []string{"role_id"},
	})

	def.ForiegnKeys = append(def.ForiegnKeys, rdbmstool.ForeignKeyDefinition{
		ReferenceTableName: "account",
		Columns: []rdbmstool.FKColumnDefinition{
			rdbmstool.FKColumnDefinition{
				ColumnName:    "account_id",
				RefColumnName: "id",
			},
		},
	})
	def.ForiegnKeys = append(def.ForiegnKeys, rdbmstool.ForeignKeyDefinition{
		ReferenceTableName: "role",
		Columns: []rdbmstool.FKColumnDefinition{
			rdbmstool.FKColumnDefinition{
				ColumnName:    "role_id",
				RefColumnName: "id",
			},
		},
	})

	if err := validateTable(db, dbName, &def); err != nil {
		return fmt.Errorf("Failed on validate account_role db table: %s", err.Error())
	}

	return nil
}

func validateRoleTable(db *sql.DB, dbName string) error {
	def := rdbmstool.TableDefinition{
		Name:        "role",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys:  []rdbmstool.UniqueKeyDefinition{},
		Indices:     []rdbmstool.IndexKeyDefinition{},
	}

	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	def.Columns = append(def.Columns, rdbmstool.ColumnDefinition{
		Name:             "name",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})

	if err := validateTable(db, dbName, &def); err != nil {
		return fmt.Errorf("Failed on validate role db table: %s", err.Error())
	}

	return nil
}

func validateAccountTable(db *sql.DB, dbName string) error {
	//TODO: create account data table
	accountDef := rdbmstool.TableDefinition{
		Name:        "account",
		Columns:     []rdbmstool.ColumnDefinition{},
		PrimaryKey:  []string{"id"},
		ForiegnKeys: []rdbmstool.ForeignKeyDefinition{},
		UniqueKeys:  []rdbmstool.UniqueKeyDefinition{},
		Indices:     []rdbmstool.IndexKeyDefinition{},
	}

	accountDef.Columns = append(accountDef.Columns, rdbmstool.ColumnDefinition{
		Name:             "id",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	accountDef.Columns = append(accountDef.Columns, rdbmstool.ColumnDefinition{
		Name:             "username",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	accountDef.Columns = append(accountDef.Columns, rdbmstool.ColumnDefinition{
		Name:             "pwd",
		DataType:         rdbmstool.CHAR,
		Length:           100,
		IsNullable:       false,
		DecimalPrecision: 0,
	})
	/*
		accountDef.Columns = append(accountDef.Columns, rdbmstool.ColumnDefinition{
			Name:             "full_name",
			DataType:         rdbmstool.CHAR,
			Length:           200,
			IsNullable:       false,
			DecimalPrecision: 0,
		})*/

	accountDef.UniqueKeys = append(accountDef.UniqueKeys, rdbmstool.UniqueKeyDefinition{
		ColumnNames: []string{"username"},
	})

	if err := validateTable(db, dbName, &accountDef); err != nil {
		return fmt.Errorf("Failed on validate account db table: %s", err.Error())
	}

	return nil
}

func validateTable(db *sql.DB, dbName string, tableDef *rdbmstool.TableDefinition) error {

	query := mysql.MetaQuery{}

	tables, err := query.GetTableNames(db, dbName, tableDef.Name)
	if err != nil {
		return err
	}
	found := false
	for _, tableName := range tables {
		if strings.Compare(tableName, tableDef.Name) == 0 {
			found = true
		}
	}

	if found {
		return nil
	}

	sql, err := rdbmstool.GenerateTableSQL(tableDef)
	if err != nil {
		return err
	}

	trx, err := db.Begin()
	if err != nil {
		return err
	}
	if _, err = trx.Exec(sql); err != nil {
		return err
	}
	if err := trx.Commit(); err != nil {
		return err
	}

	return nil
}
