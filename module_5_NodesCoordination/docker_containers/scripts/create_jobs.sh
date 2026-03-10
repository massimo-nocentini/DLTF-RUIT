#!/bin/bash
echo "Creating bootstrap Oracle job"
docker exec -it chainlink_node11 bash -c 'cd /home/root; chmod +x chainlink_login.sh; chmod +x chainlink_delete_job.sh; ./chainlink_login.sh; ./chainlink_delete_job.sh; chainlink jobs create "/home/root/job.toml";exit'
echo "---------------------------------------"

count=10
for i in $(seq $count); do
	echo "Creating job on Oracle $i"
    node="chainlink_node$i"
    docker exec -it chainlink_node$i bash -c 'cd /home/root; chmod +x chainlink_login.sh; chmod +x chainlink_delete_job.sh; ./chainlink_login.sh; ./chainlink_delete_job.sh; chainlink jobs create "/home/root/ocr_job.toml"; chainlink jobs create "/home/root/data_job.toml";exit'
    echo "---------------------------------------"
done