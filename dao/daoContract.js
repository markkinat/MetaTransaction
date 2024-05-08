const {setUpContract}  = require("../constants/setUpContract");
const {setUpWallet} = require("../constants/setUpWallet");

require("dotenv").config();
const DAO_ABI = require("../abis/DaoAbi.json");

async function changeBalance(data) {
    try {
        let wallet = setUpWallet();

        let contract = setUpContract("", "", wallet);

        let tx = await contract.changeBalance(data.from, data.amount);
        let receipt = await tx.wait();
        if (receipt.status) {
            return {
                success: true, tx, message: "sent in"
            }
        } else {
            return {
                success: false, tx, message: "failed"
            }
        }
    } catch (error) {
        console.error(error)
        return {
            success: false, tx: {}, message: error?.reason ?? "" 
        }
    }
}

async function createProposal(data) {
    try {

        let wallet = setUpWallet();

        const contract = setUpContract(process.env.DAO_CONTRACT_ADDRESS, DAO_ABI, wallet);

        const tx = await contract.createProposal(data.intiator, data.name, data.deadLine, data.desc);
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

        const contract = setUpContract(process.env.DAO_CONTRACT_ADDRESS, DAO_ABI, wallet);

        const tx = await contract.voteOnProposal(data.intiator, data.proposalId, data.decision, data.tokenId);
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

        const contract = setUpContract(process.env.DAO_CONTRACT_ADDRESS, DAO_ABI, wallet);

        const tx = await contract.delegateVotingPower(data.intiator, data.delegate, data.tokenId, data.proposalId);
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

        const contract = setUpContract(process.env.DAO_CONTRACT_ADDRESS, DAO_ABI, wallet);

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

module.exports = {
    createProposal, 
    voteOnProposal, 
    delegateVotingPower,
    executeProposal,
    changeBalance
}