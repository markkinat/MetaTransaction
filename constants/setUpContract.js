const ethers = require("ethers");

function setUpContract(contractAddress, abi, wallet) {
    return new ethers.Contract(contractAddress, abi, wallet);
}

module.exports = {
    setUpContract
}