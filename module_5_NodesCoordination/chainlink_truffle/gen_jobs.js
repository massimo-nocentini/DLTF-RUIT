keyb_id =  ["0d3971bec903bad87fcc52b408cd776c7ccc30b90081a7bd5779a889c4585844","d9757a507fa2db035226e0bf2187e071104da89b35507786b4e57a6a85bb7a82","af74850033e97d138095836a8a526fc1e47d8749e27d929cf06e1c30ee59e290","7cba81590c33d061507551abf9e7debd557d9125231d3464ba2ab7a98be17e5f"]
p2p_id = ["12D3KooWBp8L1Pgs4Rkp5Y2empyh6gp7jEvh9TXyAM6excuKeFn6","12D3KooWNtyFWtr9diADRrNqNUd4zAExmNbnnDMzyx7dRKjAM1cR","12D3KooWMogrWdZ7eB8ynkwLuUaJDESbBsNtHqrVdVSwVxFVnJug","12D3KooWPEXdvR2z8JFs5usUc9tGgJurrmSQeYCpWUGbBq3SGuTH"]
transmit_address = ["0x4cD73f70fd4f0Cbf61F18132B429742cE3798f9e","0x0C422c6266A356961d97f19C997FF54492308959","0xaCeadFb4b07c035e865Cc342B45f983C2D12B6f5","0xa12A7068c1b61F9BF26b2957E28F080D9d2e590e"]
names = ["Oracle 88", "Oracle 89", "Oracle 90" ,"Oracle 91"]

ocr = "0xE2a8343B33fa16F295b621417c1DFc7470b2d5E1"
tracker = "0x9ce23E2B1311F57F060295aCe5d95D0D766d1097"
boots_peer = "12D3KooWJzw1nwfHLwhSm5EL7G8fhWoom4EBSbR3GEdmqbcN8oos"

for(var i=0; i<4; i++){
    console.log("\n ",names[i])

    var job = 
    `
type = "offchainreporting"
schemaVersion = 1
contractAddress = "${ocr}"
p2pPeerID = "${p2p_id[i]}"
p2pBootstrapPeers = [
"/ip4/10.5.0.8/tcp/3002/p2p/${boots_peer}"
]
isBootstrapPeer = false
keyBundleID = "${keyb_id[i]}"
transmitterAddress = "${transmit_address[i]}"
observationTimeout = "10s"
blockchainTimeout = "20s"
contractConfigTrackerSubscribeInterval = "2m0s"
contractConfigTrackerPollInterval = "1m0s"
contractConfigConfirmations = 1
observationSource = """
    // data source 1
    ds1          [type=http method=GET url="http://10.5.0.6:3000/get?tracker=${tracker}"]

    ds1
"""
maxTaskDuration = "0s"
externalJobID = "0eec7e1d-d0d2-476c-a1a8-72dfb6633f06"
    `

    console.log(job)
}