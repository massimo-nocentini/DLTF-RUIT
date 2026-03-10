pragma solidity ^0.7.1;


contract DepositLimitation {

    mapping(address => uint256) public depositSelfLimitation; //HashMap that stores for each user its self-limitation
    address[] public gamblingDapps; //List of known gambling Dapps
    address public contractOwner; //address of the contract's owner

    /**
   * @notice Modifier usd to allow access to functions only to the contract owner identified by contractOwner
   */
    modifier onlyOwner(){
        require(msg.sender == contractOwner, "Only the owner of the contract can access this function");
        _;
    }


    /**
   * @notice Smart contract constructor
   */
    constructor()
    {
        contractOwner = msg.sender;
    }


    /**
   * @notice Function called by the contract owner to set the list of known gambling Dapps
   * @param _gamblingDapps List of known gambling Dapp addresses
   */
    function setGamblingDapps(address[] memory _gamblingDapps)
    public
    onlyOwner
    {
        gamblingDapps = _gamblingDapps;
    }


    /**
   * @notice Function called by users to set the monthly self-limitation
   * @param selfLimitation amount of Ether a user wants to spend maximum per month on gambling dapp
   */
    function setMonthlySelfLimitation(uint256 selfLimitation)
    public
    {
        depositSelfLimitation[msg.sender] = selfLimitation;
    }


    /**
   * @notice Function called to get a user self-limitation
   * @param user User whose self-limitation is desired
   */
    function getMonthlySelfLimitation(address user)
    public
    view
    returns(uint256)
    {
        return depositSelfLimitation[user];
    }


    /**
   * @notice Function called to the list of known gambling Dapps
   */
    function getGamblingDappsList() 
    public
    view 
    returns(address[] memory) {
        return gamblingDapps;
    }

}