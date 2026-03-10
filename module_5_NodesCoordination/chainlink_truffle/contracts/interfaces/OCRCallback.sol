pragma solidity ^0.7.0;

interface OCRCallbackInterface {
  function hashCallback(uint64 req_id, uint128 data_hash, uint256 link_payed) external;
}