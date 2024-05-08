
const { Wallet } = require("ethers");
require("dotenv").config();
const fs = require("fs-extra")
const ethers = require("ethers");

function setUpWallet() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

    const encryptedJsonKey = fs.readFileSync("constants/encryptedKey.json", "utf8");
    let wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedJsonKey, process.env.PRIVATE_KEY_PASSWORD);
    wallet = wallet.connect(provider);
    
    return wallet;
}

module.exports = {
    setUpWallet
}