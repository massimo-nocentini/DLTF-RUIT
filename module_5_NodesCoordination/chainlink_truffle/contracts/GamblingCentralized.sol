import "./ocr-lib/LinkTokenInterface.sol";
import "./DepositLimitation.sol";
import "./centralized-oracle-lib/ChainlinkClient.sol";
pragma solidity ^0.7.1;


contract GamblingCentralized is ChainlinkClient{

    event DepositResult(string message, address user);
    using Chainlink for Chainlink.Request;


    DepositLimitation public userDepositLimitation; //Instance of the system DepositLimitation-SC
    mapping(address => uint256) public userPendingDeposit;
    mapping(address => uint256) public userBalance; 

    address public contractOwner;

    uint32 private secondsInOneMonth = 2592000;
    uint256 private dappBalance;
    uint256 private totalUsersBalance;

    LinkTokenInterface public link; //instance of the contract managing the LINK token
    uint256 public LINKperWei; //How much LINKs are worth 1 Wei. Used for the LINK/ETH conversion

    uint256 public called = 0;

    bytes32 public jobID;
    uint256 dr_payment;

    /**
   * @notice Modifier usd to allow access to functions only to teh contract owner identifyed by contractOwner
   */
    modifier onlyOwner(){
        require(msg.sender == contractOwner, "Only the owner of the contract can access this function");
        _;
    }

    /**
   * @notice Smart contract constructor
   */
    constructor(bytes32 _jobID, uint256 _dr_payment, uint256 _LINKperWei, address _link, address _userDepositLimitation, address _DRcontract)
    payable
    {
        dappBalance += msg.value;
        contractOwner = msg.sender;
        LINKperWei = _LINKperWei;
        link = LinkTokenInterface(_link);
        userDepositLimitation = DepositLimitation(_userDepositLimitation);
        jobID = _jobID;
        dr_payment = _dr_payment;
        setChainlinkToken(_link);
        setChainlinkOracle(_DRcontract);
    }


    /**
     * @notice Initialize the deposit process, called by users who wants to deposit funds to play
     */
    function deposit()
    public
    payable
    {
        userPendingDeposit[msg.sender] = msg.value;
        Chainlink.Request memory req = buildChainlinkRequest(jobID, address(this), this.result.selector);
        req.add("user", addressToString(msg.sender));
        sendChainlinkRequest(req, dr_payment);
    }



    function result(bytes32 requestID, address user, uint256 amountDeposited)
    external
    {

        uint256 userMaxMountlyDeposit = userDepositLimitation.getMonthlySelfLimitation(user);
        if(amountDeposited+userPendingDeposit[user] <= userMaxMountlyDeposit){
            userBalance[user] = userPendingDeposit[user];
            emit DepositResult("Deposit completed successfully!", user);
        }else{
            emit DepositResult("Deposit canceled, you have exceeded your monthly limit", user);
        }

        userPendingDeposit[user] = 0;
    }


    /**
     * @notice Function that implements a simple gambling game. The user places a bet and if the function 
               randomly generates an even number, s/he wins, otherwise if it is odd s/he loses.
     * @param betAmount bet amount expressed in Wei
     */
    function playBet(uint256 betAmount)
    public
    returns(bool)
    {
        require(userBalance[msg.sender]>=betAmount, "Error: Not enough balance");
        require(dappBalance>=betAmount, "Error: The Dapp does not enough balance to cover the bet");

        uint8 random = uint8(uint256(keccak256( abi.encodePacked(block.timestamp, block.difficulty)))%251);
        bool outcome = rand()%2 == 0;
        if(outcome){
            userBalance[msg.sender] += betAmount;
            dappBalance -= betAmount;
        }else{
            userBalance[msg.sender] -= betAmount;
            dappBalance += betAmount;
        }
        return outcome;
    }



    /**
     * @notice Function called by both users and the contract owner to withdraw any winnings
     * @param amount amount of Wei to withdraw
     */
    function withdrawWin(uint256 amount)
    public
    {
        if(msg.sender==contractOwner){
            require(dappBalance>=amount, "Error: Not enough balance");
            dappBalance -= amount ;
            msg.sender.transfer(amount);
        }else{
            require(userBalance[msg.sender]>=0, "Error: Not enough balance");
            userBalance[msg.sender] -= amount;
            msg.sender.transfer(amount);
        }
    }


    /**
   * @notice Function called by the contract owner to add funds and increase the Dapp balance
   */
    function fundDapp()
    public
    payable
    onlyOwner
    {
        require(msg.value > 0, "You must send some Eth to fund the contract");
        dappBalance += msg.value;
    }


    // Get & Set functions


    function setLinkPerWei(uint256 _LINKperWei)
    public
    onlyOwner
    {
        LINKperWei = _LINKperWei;
    }

    function getBalance()
    public
    view
    returns(uint256)
    {
        return address(this).balance;
    }
    

    /**
   * @notice Function used to generate a random number
   */
    function rand()
    public
    view
    returns(uint256)
    {
        uint256 seed = uint256(keccak256(abi.encodePacked(
            block.timestamp + block.difficulty +
            ((uint256(keccak256(abi.encodePacked(block.coinbase)))) / (block.timestamp)) +
            block.gaslimit + 
            ((uint256(keccak256(abi.encodePacked(msg.sender)))) / (block.timestamp)) +
            block.number
        )));

        return (seed - ((seed / 1000) * 1000));
    }


    function addressToString(address _address) public pure returns (string memory _uintAsString) {
      uint _i = uint256(_address);
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
      uint k = len - 1;
      while (_i != 0) {
          bstr[k--] = byte(uint8(48 + _i % 10));
          _i /= 10;
      }
      return string(bstr);
    }
}
