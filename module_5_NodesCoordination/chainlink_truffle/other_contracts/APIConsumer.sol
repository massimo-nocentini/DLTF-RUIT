pragma solidity ^0.6.6;
import "@chainlink/contracts/src/v0.6/ChainlinkClient.sol";

contract APIConsumer is ChainlinkClient {
  
    uint public  randomNumber;
    address public oracle;
    bytes32 public jobId;
    uint256 public fee;
    
    constructor(address _link, address _oracle, string memory _jobID) public {
    //Fill in the Oracle address we just deployed
        oracle = _oracle;
    //Fill in the address we just created
        jobId = stringToBytes32(_jobID);
    //The minimum fee paid to Oracle can be found in the configuration page minimum_ CONTRACT_ View the payment field
        fee = 1 * 10 ** 18; // 1 LINK
        setChainlinkToken(_link);
    }
    
    
    function getValue() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        //add query params
        //request.add("queryParams","num=1&col=1&base=10&format=plain&rnd=new&min=10&max=100");
        
        //Send request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    function fulfill(bytes32 _requestId, uint _num) public recordChainlinkFulfillment(_requestId)
    {
        randomNumber = _num;
    }
    
    function setOracle(address _oracle) public{
        oracle = _oracle;
    }
    
    function setJobID(string memory _jobID) public{
        jobId = stringToBytes32(_jobID);
    }
    
    function setFee(uint256 _fee) public{
        fee = _fee;
    }
    
    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            result := mload(add(source, 32))
        }
    }
}
