const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { createMarketPlaceListing,
        performMarketPlaceBid,
        claimMarketPlaceAuction } = require("./marketPlace/marketPlaceContract");

const { createProposal,
        voteOnProposal,
        delegateVotingPower,
        executeProposal } = require("./dao/daoContract");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("common"));


function verifyMessageWithEthers(message, signature) {
    const signerAddress = ethers.verifyMessage(message, signature);
    return signerAddress;
}

app.post("/marketplace/create-listing", async (req, res) => {
    const data = req.body;
    const recievedData = { ...data.params };
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        params: recievedData
    }), data.signature);

    if (signerAddress.toString() === recievedData.intiator.toString()) {
        
        createMarketPlaceListing(recievedData).then(tx => {
            if (tx.success) {
                res.status(201).send(tx)
            } else {
                res.status(500).send(tx);
            }
        }).catch(error => {
            console.error(error);
            return {
                success: false, tx: {}, message: error?.reason ?? "error"
            }
        })
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
});

app.post("/marketplace/auctionBid", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        auctionId: data.auctionId,
        bidAmount: data.bidAmount
    }), data.signature);

    if (signerAddress.toString() === data.intiator.toString()) {
        const tx = await performMarketPlaceBid(data);
        if (tx.success) {
            res.status(201).send(tx);
        } else {
            res.status(500).send(tx);
        }
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
})

app.post("/marketplace/auction-claim", async (req, res) => {
    const data = req.body;

    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        auctionId: data.auctionId
    }), data.signature);

    if (signerAddress.toString() === data.params.intiator) {

        const tx = await claimMarketPlaceAuction(data);
        if (tx.success) {
            res.status(201).send(tx);
        }
        else {
            res.status(500).send(tx)
        }
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
});

app.post("/dao/create-proposal", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        name: data.name,
        deadLine: data.deadLine,
        desc: data.description
    }), data.signature);

    if (signerAddress.toString() === data.intiator.toString()) {
        createProposal(data).then(tx => {
            if (tx.success) {
                    res.status(201).send(tx)
            } else {
                    res.status(400).send({
                    success: false,
                    tx: tx, 
                    message: "Proposal creation failed",
                    error: tx.error || "An unknown error occurred" 
                    });
                }
        }).catch(error => {
            console.error(error)
            res.status(500).send({
                success: false,
                tx: null,
                message: "Internal server error during proposal creation",
                errorDetails: error.message || "An unknown error occurred" 
            });
        })
    } else {
        res.status(400).send({ success: false, message: "couldn't verify signature" });
    }
});

app.post("/dao/vote-on-proposal", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        proposalId: data.proposalId,
        decision: data.decision,
        tokenId: data.tokenId
    }), data.signature);

    if (signerAddress.toString() === data.intiator.toString()) {
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

app.post("/dao/delegate-vote", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        delegate: data.delegate,
        tokenId: data.tokenId,
        proposalId: data.proposalId
    }), data.signature);

    if (signerAddress.toString() === data.intiator.toString()) {
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

app.post("/dao/execute-proposal", async (req, res) => {
    const data = req.body;
    const signerAddress = verifyMessageWithEthers(JSON.stringify({
        intiator: data.intiator,
        proposalId : data.proposalId
    }), data.signature);

    if (signerAddress.toString() === data.intiator.toString()) {
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
