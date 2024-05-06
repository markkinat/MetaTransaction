const ethers = require("ethers")
const fs = require("fs-extra")
require("dotenv").config();
const ABI = require("./TestingAbi.json")
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { Wallet } = require("ethers");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("common"));


function setUpWallet() {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const encryptedJsonKey = fs.readFileSync("./.encryptedKey.json", "utf8");
    let wallet = ethers.Wallet.fromEncryptedJsonSync(encryptedJsonKey, process.env.PRIVATE_KEY_PASSWORD);
    wallet = wallet.connect(provider);
    return wallet;
}

function setUpContract(contractAddress, abi, wallet) {
    return new ethers.Contract(contractAddress, abi, wallet);
}


async function changeBalance(data) {
    try {

        let wallet = setUpWallet();

        const contract = setUpContract(process.env.CONTRACT_ADDRESS, ABI, wallet);
        const tx = await contract.changeBalance(data.from, data.amount);
        const receipt = await tx.wait();
        if (receipt.status) {
            return { success: true, tx, message: "sent" }
        } else {
            return { success: false, tx, message: "failed" }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false, tx: {}, message: error?.reason ?? "ERROR_OCCURED"
        }
    }
}

async function createProposal(data) {
    try {

        let wallet = setUpWallet();

        const contract = setUpContract(process.env.CONTRACT_ADDRESS, ABI, wallet);
        
        const tx = await contract.createProposal(data.intiator, data._name, data._deadLine, data.desc);
        const receipt = await tx.wait();

        if (receipt.status) {
            return { success: true, tx, message: "sent" }
        } else {
            return { success: false, tx, message: "failed" }
        }

    } catch (error) {
        console.error(error);
        return {
            success: false, tx: {}, message: error?.reason ?? "ERROR_OCCURED"
        }
    }
}


async function voteOnProposal(data) {
    try {

        let wallet = setUpWallet();

        const contract = setUpContract(process.env.CONTRACT_ADDRESS, ABI, wallet);

        const tx = await contract.voteOnProposal(data.intiator, data.proposalId, data.decision, data._tokenId);
        const receipt = await tx.wait();

        if (receipt.status) {
            return { success : true, tx, message: "sent" }
        } else {
            return { success : false, tx, message: "failed" }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false, tx: {}, message: error?.reason ?? "ERROR_OCCURED"
        }
    }
}

async function delegateVotingPower(data) {
    try {

        let wallet = setUpWallet();

        const contract = setUpContract(process.env.CONTRACT_ADDRESS, ABI, wallet);

        const tx = await contract.delegateVotingPower(data.intiator, data._delegate, data._tokenId, data.proposalId);
        const receipt = await tx.wait();

        if (receipt.status) {
            return {
                success: true, tx, message: "sent"
            }
        } else {
            return {
                success: false, tx, message: "failed"
            }
        }
    } catch (error) {
        console.error(error);
        return { success: false, tx: {}, message: error?.reason ?? "ERROR_OCCURED" }
    }
}

async function executeProposal(data) {
    try {
        
        let wallet = setUpWallet();

        const contract = setUpContract(process.env.CONTRACT_ADDRESS, ABI, wallet);

        const tx = await contract.executeProposal(data.intiator, data.proposalId);
        const receipt = await tx.wait();

        if (receipt.status) {
            return {
                success: true, tx, message: "sent"
            }
        } else {
            return {
                success: false, tx, message: 'failed'
            }
        }
    } catch (error) {
        console.error(error);
        return {
            success: false, tx: {}, message: error?.reason ?? "ERROR_OCCURED"
        }
    }
}

function verifyMessageWithEthers(message, signature) {
    const signerAddress = ethers.verifyMessage(message, signature);
    return signerAddress;
}


app.post("/change-balance", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        from: data.from,
        amount: data.amount,
    }), data.signature);

    if (signerAddress.toString() === data.from.toString()) {
        const tx = await changeBalance(data);
        if (tx.success) {
            res.status(200).send(tx)
        } else {
            res.status(500).send(tx)
        }
    } else {
        res.status(400).send({ success: false, message: "Invalid signature" })
    }
})

app.post("/create-proposal", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        _name: data.title,
        _deadLine: data.deadLine,
        desc: data.description
    }), data.signature);
    if (signerAddress.toString()) {
        const tx = await createProposal(data);
        if (tx.success) {
            res.status(200).send(tx);
        } else {
            res.status(500).send(tx);
        }
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
});

app.post("/vote-on-proposal", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        proposalId: data.proposalId,
        decision: data.decision,
        _tokenId: data._tokenId
    }), data.signature);

    if (signerAddress.toString()) {
        const tx = await voteOnProposal(data);
        if (tx.success) {
            res.status(200).send(tx);
        } else {
            res.status(500).send(tx);
        }
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
});

app.post("/delegate-vote", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        proposalId: data.proposalId
    }), data.signature);

    if (signerAddress.toString()) {
        const tx = await delegateVotingPower(data);
        if (tx.success) {
            res.status(200).send(tx);
        } else {
            res.status(500).send(tx);
        }
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
});

app.post("/execute-proposal", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        _delegate : data._delegate,
        _tokenId: data._tokenId,
        proposalId : data.proposalId
    }), data.signature);

    if (signerAddress.toString()) {
        const tx = await executeProposal(data);
        if (tx.success) {
            res.status(200).send(tx);
        } else {
            res.status(500).send(tx);
        }
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature"});
    }
});

app.get("/", async (req, res) => {
    res.send("i am loading...");
})

const server = app;
const PORT = 5000 || process.env.PORT
server.listen(5000, async () => {
    console.log("server running on port ", PORT);

});

