
const ethers = require("ethers");
require("dotenv").config();


async function generateSignature(from, amount) {
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_PASSWORD);
    const message = JSON.stringify({ from, amount });
    const signature = await wallet.signMessage(message);
    return signature;
}

async function main() {

    const tx = await generateSignature("0x4B59b152AaBdFE6226cefdBde9e866694555616b", 100);

    console.log(tx);
    // const response = tx.wait();
}

    console.log("private key is ", process.env.PRIVATE_KEY_PASSWORD);




    // const tx = await generateSignature("0x4B59b152AaBdFE6226cefdBde9e866694555616b", 100);
    main().catch((error) => {
        console.log(error);
        process.exitCode = 2;
    });