#!/bin/bash

empty=' '
job=`chainlink jobs list | awk 'NR == 5 {print $2}'`
chainlink jobs delete $job
job=`chainlink jobs list | awk 'NR == 5 {print $2}'`
chainlink jobs delete $job
echo "End"
