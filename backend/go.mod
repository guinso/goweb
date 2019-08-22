module goweb

go 1.12

require (
	github.com/guinso/rdbmstool v1.0.1
	github.com/guinso/stringtool v1.0.1
	github.com/mattn/go-sqlite3 v1.10.0
	gopkg.in/go-sql-driver/mysql.v1 v1.4.1
	gopkg.in/ini.v1 v1.42.0

	localsrc v0.0.0
)

replace localsrc => ./
