pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;
import "./interfaces/OCRCallback.sol";
import "./interfaces/ResultCallback.sol";
import "./OffchainAggregator.sol";
import "./centralized-oracle-lib/ChainlinkClient.sol";
import "./ocr-lib/LinkTokenInterface.sol";


contract RequestManager is OCRCallbackInterface, ChainlinkClient {

    using Chainlink for Chainlink.Request;

    // Struct representing a request
    struct Request{
        // static parameters
        ResultCallbackInterface requester;
        uint128 dataHash; //hash of amount deposited provided by OCR-SC
        uint256 OCRstartTime;
        uint256 OCRendTime;
        uint256 dataReceivedTime;
        address respondingOracle;
        uint256 linkPayed;
        // application-dependent parameter
        uint256 depositTime;
        uint256 amountDeposited;//actual amount deposited provided by DR-SC
        address payable user;
    }
    

    event NewRequest(uint64 rId); //event emitted when OCR-SC start satisfying a new request
    event DataReceived(string msg, uint64 roundID); // event emitted when DR-SC returns a result
  
    //state variables used to manage the requests queue
    uint64 public reqId = 0;
    mapping(uint64 => Request) public requestsQueue;
    uint64 private firstReqID = 0;
    uint64 private lastReqID = 0;
    uint256 public maxReqTime;
    uint64 public currReq = 0;
   
    bytes32 public jobID; //jobID related to the work of hypo DR implemented by the oracles
    uint256 public dataFetchLinkCost; //cost in LINk of the DR job that provides the actual data given the hash
    address public DRcontract; //address of the system DR-SC contract
    OffchainAggregator public OCRcontract; //instance of the system OCR-SC contract
    LinkTokenInterface public link; //instance of the contact amangeing the LINK token


    /**
   * @notice Modifier usd to allow access to functions only to OCR-SC contract
   */
    modifier OnlyOCR() {
        require(msg.sender==address(OCRcontract), "Only the OCR contract can access this function");
        _;
    }

    /**
   * @notice Modifier usd to allow access to functions only to DR-SC contract
   */
    modifier OnlyDR() {
        require(msg.sender==address(DRcontract), "Only the DR contract can access this function");
        _;
    }

    /**
   * @notice Smart contract constructor 
   * @param _dataFetchLinkCost Cost of requesting the corresponding data of a given hash 
   * @param _DRcontract Address of the Operator.sol contract used to request data on a given hash 
   * @param _jobID JobID specified on the oracle to interact vith the Operator.sol
   * @param _link Link token address
   */
    constructor (uint256 _dataFetchLinkCost, address _DRcontract, bytes32 _jobID, address _link)
    {
        DRcontract = _DRcontract;
        dataFetchLinkCost = _dataFetchLinkCost;
        setChainlinkToken(_link);
        setChainlinkOracle(_DRcontract);
        jobID = _jobID;
        link = LinkTokenInterface(_link);
    }


    /**
   * @notice Function called to request a new observation, i.e., to know, given a user address,
   *         how much s/he has spent in gambling Dapps in the last _depositTime seconds
   * @param _depositTime Observation period, usually set at 2592000 which are the seconds that make up a month
   * @param _user User address on which observation is requested
   */
    function makeObservation(uint256 _depositTime, address payable _user)
    public
    returns(uint64)
    {
        reqId++;
        lastReqID = reqId;
        Request memory newRequest = Request(ResultCallbackInterface(msg.sender), 0, 0, 0, 0, address(0), _depositTime, 0, 0, _user);
        requestsQueue[reqId] = newRequest;
        tryNewRound();
        return reqId;
    }


    /**
   * @notice Function called to check if OCR-SC is OCR-SC is available to satisfy a new request, and if it is, notify it of it
   */
    function tryNewRound()
    public
    {
        uint256 _now = block.timestamp;
        if( (currReq==0 || requestsQueue[currReq].OCRstartTime+maxReqTime<_now) && firstReqID<lastReqID ){
            firstReqID++;
            currReq = firstReqID;
            uint256 OCRcost = OCRcontract.maxRequestLinkCost();
            require(link.transferFrom(address(requestsQueue[currReq].requester), address(OCRcontract), OCRcost), 
                "Error: insufficient LINK to fund the OCR job");
            requestsQueue[currReq].linkPayed = OCRcost;
            requestsQueue[currReq].OCRstartTime = _now;
            OCRcontract.requestNewRound(address(requestsQueue[currReq].requester));
            emit NewRequest(firstReqID);
        }
    }


    /**
   * @notice callback Function called by OCR-SC to return the hash of the requested data
   * @param req_id Request id to which the hash refers
   * @param data_hash Hash of the requested data
   * @param link_payed Amount of LINKs OCR-SC has spent to pay the oracles partecipating in the observation
   */
    function hashCallback(uint64 req_id, uint128 data_hash, uint256 link_payed)
    external
    override
    OnlyOCR
    {
       requestsQueue[req_id].dataHash = data_hash;
       requestsQueue[currReq].linkPayed -= link_payed;
       requestsQueue[req_id].OCRendTime = block.timestamp;
       requestActualData(req_id, data_hash); 
       currReq = 0;
       tryNewRound();
    }


    /**
   * @notice Callback Function called to request the actual data given the data hash returned by OCR-SC
   * @param req_id Request to which the hash refers
   * @param data_hash Data hash previously returned by OCR-SC
   */
    function requestActualData(uint64 req_id, uint128 data_hash) 
    internal
    {
        require(link.transferFrom(address(requestsQueue[req_id].requester), address(this), dataFetchLinkCost), 
            "Error: insufficient LINK to fund the Direct Request job");
        Chainlink.Request memory req = buildChainlinkRequest(jobID, address(this), this.dataCallback.selector);
        req.add("hash",uint2str(data_hash));
        req.add("rid",uint2str(req_id));
        sendChainlinkRequest(req, dataFetchLinkCost);
        requestsQueue[currReq].linkPayed += dataFetchLinkCost;
    }


    /**
   * @notice Callback Function called by DR-SC to return the actual requested data
   * @param requestID Request id internal to DR-SC, not useful
   * @param amount Amount spent by the user related to the request requestQueue[queueID]
   * @param sender Address of the oracle that satisfied the request
   * @param queueID Request id in the requestQueue to which the result refers
   */
    function dataCallback(bytes32 requestID, uint256 amount, address sender, uint64 queueID) 
    public
    OnlyDR
    {        
        require(requestsQueue[queueID].dataReceivedTime==0, "Error: data not needed");
        bytes16 resHash = bytes16(keccak256(bytes(uint2str(amount))));
        require(uint128(resHash)==requestsQueue[queueID].dataHash, "Error: received value do not match the hash");
        requestsQueue[queueID].amountDeposited = uint(amount);
        requestsQueue[queueID].dataReceivedTime = block.timestamp;
        requestsQueue[queueID].respondingOracle = sender;
        requestsQueue[queueID].requester.result(requestsQueue[queueID].user, amount, requestsQueue[currReq].linkPayed);
        emit DataReceived("New data received", queueID);
    }


    // A serie of get & set functions

    function getRequest(uint64 _reqID)
    public
    view
    returns(Request memory)
    {
        return requestsQueue[_reqID];
    }


    function setOCRcontract(address addr)
    public
    {
        OCRcontract = OffchainAggregator(addr);
    }
    
    
    function setMaxReqTime(uint256 time)
    public
    {
        maxReqTime = time;
    }


    function ququeSize()
    external
    view
    returns(int)
    {
        return lastReqID - firstReqID;
    }


    function getMaxRequestLINKCost()
    public
    view
    returns(uint256)
    {
        return OCRcontract.maxRequestLinkCost()+dataFetchLinkCost;
    }



    // Utility Functions

    /**
   * @notice Function used to convert a unit to bytes
   * @param x uint number to convert to bytes
   */
    function toBytes(uint256 x) internal returns (bytes memory b) {
        b = new bytes(32);
        assembly { mstore(add(b, 32), x) }
    }


    /**
   * @notice Function used to convert a unit to string
   * @param _i uint number to convert to string
   */
    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len;
        while (_i != 0) {
            k = k-1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

}
