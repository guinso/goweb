package server

import (
	"os"
	"strconv"
	"strings"

	ini "gopkg.in/ini.v1"
)

//ConfigurationINI INI configuration handler
type ConfigurationINI struct{}

//InitializeConfiguration init .ini file
func (iniconfig *ConfigurationINI) InitializeConfiguration(filepath string) (*ConfigInfo, error) {
	//check INI file exists or not; otherwise create one
	if !iniconfig.isFileExists(filepath) {
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
		if err = cfg.SaveTo(filepath); err != nil {
			return nil, err
		}
	}

	return iniconfig.reload(filepath)
}

//LoadConfiguration load .ini file
func (iniconfig *ConfigurationINI) LoadConfiguration(filepath string) (*ConfigInfo, error) {
	return iniconfig.reload(filepath)
}

//reload load .ini file
func (iniconfig *ConfigurationINI) reload(filepath string) (*ConfigInfo, error) {
	cfg, err := ini.InsensitiveLoad(filepath) //ignore capital letter key, all keys is small letter

	//save configuration to physical INI file before exit
	defer cfg.SaveTo(filepath)

	if err != nil {
		return nil, err
	}

	config := ConfigInfo{}

	dbSection, err := cfg.GetSection("database")
	if err != nil {
		return nil, err
	}
	if config.DbAddress, err = iniconfig.getConfigString(dbSection, "dbserver", "localhost"); err != nil {
		return nil, err
	}
	if config.DbName, err = iniconfig.getConfigString(dbSection, "dbname", ""); err != nil {
		return nil, err
	}
	if config.DbUsername, err = iniconfig.getConfigString(dbSection, "dbusername", "root"); err != nil {
		return nil, err
	}
	if config.DbPassword, err = iniconfig.getConfigString(dbSection, "dbpassword", ""); err != nil {
		return nil, err
	}
	if config.DbPort, err = iniconfig.getConfigInt(dbSection, "dbport", "3306"); err != nil {
		return nil, err
	}
	tmp, err := iniconfig.getConfigString(dbSection, "dbinittable", "false")
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
	if config.PortNumber, err = iniconfig.getConfigInt(httpSection, "portnumber", "80"); err != nil {
		return nil, err
	}
	if config.LogicDir, err = iniconfig.getConfigString(httpSection, "logicaldir", "logical-files"); err != nil {
		return nil, err
	}
	if config.StaticDir, err = iniconfig.getConfigString(httpSection, "staticdir", "static-files"); err != nil {
		return nil, err
	}

	return &config, nil
}

func (iniconfig *ConfigurationINI) getConfigString(section *ini.Section, key string, defaultValue string) (string, error) {
	if section.Haskey(key) {
		return section.Key(key).String(), nil
	}

	section.NewKey(key, defaultValue)
	return defaultValue, nil
}

func (iniconfig *ConfigurationINI) getConfigInt(section *ini.Section, key string, defaultValue string) (int, error) {
	if section.Haskey(key) {
		return section.Key(key).Int()
	}

	section.NewKey(key, defaultValue)
	return strconv.Atoi(defaultValue)
}

func (iniconfig *ConfigurationINI) isFileExists(filename string) bool {
	if _, err := os.Stat(filename); err != nil {
		if os.IsNotExist(err) {
			return false //file not found
		}

		return false //stat command error
	}

	return true //file exists
}

func (iniconfig *ConfigurationINI) isDirectoryExists(directoryName string) (bool, error) {
	stat, err := os.Stat(directoryName)

	if err != nil {
		return false, nil //other errors
	}

	return stat.IsDir(), nil
}
