#!/bin/sh

packageName="github.com/guinso/goweb"

printf "========= GoWeb Test Script ========\r\n\r\n"
printf "Before start test please make sure:\r\n"
printf "1.   Target to test development database\r\n"
printf "1.1. Please go to ./util/helper.go to modify GetTestDB() \r\n"
printf "2.   Start goweb web service ( $> ./goweb )\r\n\r\n"
read -p "Press <enter> to proceed"

printf "\r\n### Reinitialize database ###\r\n"
printf "* clear databases    "
go test github.com/guinso/goweb/server -run ^(TestClearDatabase)$
printf "* generate test records    "
go test github.com/guinso/goweb/server -run ^(TestGenerateRecords)$

printf "\r\n####### Run Unit Tests ######\r\n"
printf "* test authentication\r\n"
go test $packageName/authentication
printf "n* test authorization\r\n"
go test $packageName/authorization

printf "\r\n#### Run Web API test #######\r\n"
go test $packageName/testwebapi

printf "\r\n##### Start Benchmark #######\r\n"

printf "\r\n"
read -n 1 -s -r -p "Press any key to continue"