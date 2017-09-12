# goweb
cookie cutter for small scale web application
![desktop](https://user-images.githubusercontent.com/1818236/30304876-578c3bea-97a2-11e7-94cb-a2fa57e79edd.png)
![mobile](https://user-images.githubusercontent.com/1818236/30304806-f23d7bd2-97a1-11e7-968c-1a6f0ec6fad9.png)

# Features
- **Authentication**: 
   
    cookies + login session LUT
- **Authorization**: 

    role and access LUT
- **Web API**:  
    > http://server-host/api/*
- **Static File**: 
    > http://server-host/*
- **Virtual File Server**: 

    hide physical file path from end user

# Setup & Run Web Server
1. Install MySQL server
2. edit **config.ini**
    * modify _database_ section's setting
    * enable `dbinittable` if you wish to auto generate authentication and authorization data table
3. build and run
    > $> go build

    > $> ./goweb

# Setup & Run Unit Test
1. Create an empty database
2. Start run with enable flag `dbinittable` and change database setting pointed to newly created database
    * in order to generate all basic data tables
    * test record will not affect in-production database
3. Edit **./util/helper.go**
    * modify `GetTestDB()` function to target your test database
4. Go to **./generateRecord_test.go**
    * uncomment `TestGenerateRecords()`
    * run test on `TestGenerateRecords()`
    * comment back `TestGenerateRecords()`
5. Run unit test
    > $> go test ./...