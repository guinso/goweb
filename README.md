# goweb
cookie cutter for small scale web application

# Features
- **Authentication**: cookies + login session LUT
- **Authorization**: role and access LUT
- **Web API**: start from URL /api/*
- **Static File**: from URL /*  (excepet /api/*)
- **Virtual File Server**: hide physical file path from end user

# Setup & Run Web Server
1. Install MySQL
2. edit config.ini
    * modify database section's setting
    * enable **dbinittable** if you wish to auto generate authentication and authorization data table
3. build and run
    * $> go build
    * $> ./goweb

# Setup & Run Unit Test
1. Create an empty database
2. Start run with enable flag **dbinittable**
    * in order to generate all basic data tables
3. Go to ./util/helper_test.go
    * uncomment TestGenerateRecords()
    * run test on TestGenerateRecords()
    * comment back TestGenerateRecords()
1. Edit ./util/helper.go -> GetTestDB()
    * modify to target your test database
2. Run unit test
    * $> go test ./...