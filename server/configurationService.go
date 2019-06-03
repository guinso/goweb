package server

//ConfigInfo configuration file information
type ConfigInfo struct {
	DbAddress   string //database address; e.g. localhost
	DbName      string //database name
	DbUsername  string //database username
	DbPassword  string //database password
	DbPort      int    //database port number
	DbInitTable bool   //flag; create basic datatable if not found

	EmailServer     string //SMTP email server address
	EmailPortNumber int    //SMTP email server port number
	EMailUsername   string //SMTP email username
	EmailPassword   string //SMTP email password

	PortNumber int    //web server listen port number
	LogicDir   string //directory where store logical physical files; e.g. pay-slip.pdf
	StaticDir  string //directory where store direct access physical files; e.g. index.html
}

//ConfigurationService To load and retrieve configuration file
type ConfigurationService interface {
	LoadConfiguration(filepath string) (*ConfigInfo, error)
}
