#!/usr/bin/expect
spawn chainlink admin login
expect "Enter email:" 
send "$env(CL_API_EMAIL)\n";
expect "Enter password:"
send "$env(CL_API_PASSWORD)\n";
expect eof
