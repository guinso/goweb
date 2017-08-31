package main

import (
	"strconv"
	"strings"

	ini "gopkg.in/ini.v1"
)

type configInfo struct {
	DbAddress   string //database address; e.g. localhost
	DbName      string //database name
	DbUsername  string //database username
	DbPassword  string //database password
	DbPort      int    //database port number
	DbInitTable bool   //flag; create basic datatable if not found

	PortNumber int    //web server listen port number
	LogicDir   string //directory where store logical physical files; e.g. pay-slip.pdf
	StaticDir  string //directory where store direct access physical files; e.g. index.html
}

func initializeConfiguration() (*configInfo, error) {
	//check INI file exists or not; otherwise create one
	if !isFileExists(configFilename) {
		cfg := ini.Empty()
		sec, err := cfg.NewSection("database")
		if err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbserver", "localhost"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbname", ""); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbusername", "root"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbpassword", ""); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("dbport", "3306"); err != nil {
			return nil, err
		}
		if _, err := sec.NewKey("dbinittable", "false"); err != nil {
			return nil, err
		}

		sec, err = cfg.NewSection("http")
		if _, err = sec.NewKey("portnumber", "80"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("staticdir", "static-files"); err != nil {
			return nil, err
		}
		if _, err = sec.NewKey("logicaldir", "logical-files"); err != nil {
			return nil, err
		}

		//save to physical INI file
		if err = cfg.SaveTo(configFilename); err != nil {
			return nil, err
		}
	}

	return loadConfiguration(configFilename)
}

func loadConfiguration(filename string) (*configInfo, error) {
	cfg, err := ini.InsensitiveLoad(filename) //ignore capital letter key, all keys is small letter

	//save configuration to physical INI file before exit
	defer cfg.SaveTo(configFilename)

	if err != nil {
		return nil, err
	}

	config := configInfo{}

	dbSection, err := cfg.GetSection("database")
	if err != nil {
		return nil, err
	}
	if config.DbAddress, err = getConfigString(dbSection, "dbserver", "localhost"); err != nil {
		return nil, err
	}
	if config.DbName, err = getConfigString(dbSection, "dbname", ""); err != nil {
		return nil, err
	}
	if config.DbUsername, err = getConfigString(dbSection, "dbusername", "root"); err != nil {
		return nil, err
	}
	if config.DbPassword, err = getConfigString(dbSection, "dbpassword", ""); err != nil {
		return nil, err
	}
	if config.DbPort, err = getConfigInt(dbSection, "dbport", "3306"); err != nil {
		return nil, err
	}
	tmp, err := getConfigString(dbSection, "dbinittable", "false")
	if err != nil {
		return nil, err
	}
	if strings.Compare(strings.ToLower(tmp), "true") == 0 {
		config.DbInitTable = true
	} else {
		config.DbInitTable = false
	}

	httpSection, err := cfg.GetSection("http")
	if err != nil {
		return nil, err
	}
	if config.PortNumber, err = getConfigInt(httpSection, "portnumber", "80"); err != nil {
		return nil, err
	}
	if config.LogicDir, err = getConfigString(httpSection, "logicaldir", "logical-files"); err != nil {
		return nil, err
	}
	if config.StaticDir, err = getConfigString(httpSection, "staticdir", "static-files"); err != nil {
		return nil, err
	}

	return &config, nil
}

func getConfigString(section *ini.Section, key string, defaultValue string) (string, error) {
	if section.Haskey(key) {
		return section.Key(key).String(), nil
	}

	section.NewKey(key, defaultValue)
	return defaultValue, nil
}

func getConfigInt(section *ini.Section, key string, defaultValue string) (int, error) {
	if section.Haskey(key) {
		return section.Key(key).Int()
	}

	section.NewKey(key, defaultValue)
	return strconv.Atoi(defaultValue)
}
