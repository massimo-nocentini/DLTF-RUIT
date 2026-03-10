import os
import sys


job ='''
type = "offchainreporting"
schemaVersion = 1
contractAddress = "{}"
p2pPeerID = "{}"
p2pBootstrapPeers = [
"/ip4/10.5.0.8/tcp/3002/p2p/{}"
]
isBootstrapPeer = false
keyBundleID = "{}"
transmitterAddress = "{}"
observationTimeout = "20s"
blockchainTimeout = "20s"
contractConfigTrackerSubscribeInterval = "2m0s"
contractConfigTrackerPollInterval = "1m0s"
contractConfigConfirmations = 1
observationSource = """
    // data source 1
    eth_spent_hash          [type=http method=GET url="http://10.5.0.6:3000/getDataHash?reqmanager={}&oid={}&depositlimitation={}"]

    eth_spent_hash
"""
maxTaskDuration = "0s"
externalJobID = "0eec7e1d-d0d2-476c-a1a8-72dfb6633f06"
'''

bootsrap_job='''
type               = "offchainreporting"
schemaVersion      = 1
contractAddress    = "{}"
p2pBootstrapPeers  = []
isBootstrapPeer = true
externalJobID   = "0EEC7E1D-D0D2-476C-A1A8-72DFB6633F06"
'''


dataFetcherJob='''
type = "directrequest"
schemaVersion = 1
name = "Data Fetcher"
externalJobID = "142ff888-5ecb-4152-a449-69de0b419e9e"
minContractPaymentLinkJuels = "100000000000000000" 
contractAddress = "-ope-"
maxTaskDuration = "30s"
observationSource = """

    // First, we parse the request log and the CBOR payload inside of it
    decode_log   [type="ethabidecodelog" 
                            data="$(jobRun.logData)"
                            topics="$(jobRun.logTopics)"
                            abi="OracleRequest(bytes32 indexed specId,address requester,bytes32 requestId,uint256 payment,address callbackAddr,bytes4 callbackFunctionId,uint256 cancelExpiration,uint256 dataVersion,bytes data)"]

    decode_cbor  [type="cborparse" data="$(decode_log.data)"] 

    eth_spent          [type=http method=POST url="http://10.5.0.6:3000/getSavedData" requestData="{ \\\\"hash\\\\": $(decode_cbor.hash), \\\\"rid\\\\": $(decode_cbor.rid), \\\\"oid\\\\": \\\\"-tra-\\\\"}" allowUnrestrictedNetworkAccess=true]

    encode_mwr [type="ethabiencode"
                abi="(bytes32 requestID, uint256 amount, address sender, uint64 queueID)"
                data="{\\\\"requestID\\\\": $(decode_log.requestId), \\\\"amount\\\\": $(eth_spent), \\\\"sender\\\\": \\\\"-tra-\\\\", \\\\"queueID\\\\": $(decode_cbor.rid)}"]

    encode_tx    [type="ethabiencode"
                 abi="fulfillOracleRequest2(bytes32 requestId, uint256 payment, address callbackAddress, bytes4 callbackFunctionId, uint256 expiration, bytes calldata data)"
                 data="{\\\\"requestId\\\\": $(decode_log.requestId), \\\\"payment\\\\": $(decode_log.payment), \\\\"callbackAddress\\\\": $(decode_log.callbackAddr), \\\\"callbackFunctionId\\\\": $(decode_log.callbackFunctionId), \\\\"expiration\\\\": $(decode_log.cancelExpiration), \\\\"data\\\\": $(encode_mwr)}" ]

  submit_tx  [type="ethtx" to="-ope-" data="$(encode_tx)"]
  decode_log -> decode_cbor -> eth_spent -> encode_mwr -> encode_tx -> submit_tx
"""
'''

def saveFile(name, content):
    f = open(name, "w")
    f.write(content)
    f.close()


def getConf():
    filename = "jobs/conf.txt"
    with open(filename) as file:
        lines = file.readlines()
        lines = [line.rstrip() for line in lines]
    conf={}
    conf["keyb_id"] = (lines[0].split("="))[1].split(",")
    conf["p2p_id"] = (lines[1].split("="))[1].split(",")
    conf["transmit_address"] = (lines[2].split("="))[1].split(",")
    conf["names"] = (lines[3].split("="))[1].strip()
    conf["ocr"] = (lines[4].split("="))[1].strip()
    conf["tracker"] = (lines[5].split("="))[1].strip()
    conf["boots_peer"] = (lines[6].split("="))[1].strip()
    conf["data_operator"] = (lines[7].split("="))[1].strip()
    conf["deposit_limitation"] = (lines[8].split("="))[1].strip()
    return conf

def main():
    conf = getConf()
    for i in range(0,len(conf["transmit_address"])):
        ocr_job = job.format(conf["ocr"].strip(),conf["p2p_id"][i].strip(),conf["boots_peer"].strip(),conf["keyb_id"][i].strip(),
            conf["transmit_address"][i].strip(),conf["tracker"].strip(),conf["transmit_address"][i].strip(), conf["deposit_limitation"].strip())    
        saveFile("jobs/job_ocr_oracle_{}.toml".format(str(i+1)), ocr_job)

        data_job = dataFetcherJob.replace("-ope-",conf["data_operator"].strip()).replace("-tra-",conf["transmit_address"][i].strip())
        saveFile("jobs/job_data_oracle_{}.toml".format(str(i+1)), data_job)

    boot_job = bootsrap_job.format(conf["ocr"].strip())
    saveFile("jobs/bootstrap_job.toml", boot_job)
	

if __name__ == "__main__":
	main()
	
