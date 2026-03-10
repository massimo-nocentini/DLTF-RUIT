pragma solidity ^0.7.0;
import "./interfaces/AccessControllerInterfaceC.sol";
import "./ocr-lib/Owned.sol";
//import "https://github.com/smartcontractkit/libocr/blob/master/contract/Owned.sol";


contract AccessController is AccessControllerInterface, Owned{
    mapping(address => bool) public accessList;

    event AddedAccess(address user);
    event RemovedAccess(address user);


    function hasAccess(address _user,bytes memory)
        public
        view
        virtual
        override
        returns (bool)
    {
        return accessList[_user];
    }


    function addAccess(address _user) external onlyOwner() {
        addAccessInternal(_user);
    }

    function addAccessInternal(address _user) internal {
        if (!accessList[_user]) {
        accessList[_user] = true;
        emit AddedAccess(_user);
        }
    }


    function removeAccess(address _user)
        external
        onlyOwner()
    {
        if (accessList[_user]) {
        accessList[_user] = false;

        emit RemovedAccess(_user);
        }
    }


    modifier checkAccess() {
        require(hasAccess(msg.sender, msg.data), "No access");
        _;
    }


}