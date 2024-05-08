const setUpWallet = require("../constants/setUpWallet");
const setUpContract = require("../constants/setUpContract");

require("dotenv").config();
const MarketPlace_ABI = require("../abis/MarketPlaceAbi.json");

async function createMarketPlaceListing(data) {
    try {
        let wallet = setUpWallet();

        const contract = setUpContract(process.env.MARKET_PLACE_CONTRACT_ADDRESS, MarketPlace_ABI, wallet);

        const tx = await contract.createListing(data);
        const receipt = await tx.wait();

        if (receipt.status) {
            return {
                success: true, tx, message: "successfully sent"
            }
        } else {
            return {
                success: false, tx, message: "failed to send"
            }
        }
    } catch (error) {
        console.error(error)
        return {
            success: false, tx: {}, message: error?.reason ?? "error!!!"
        }
    }
}

async function performMarketPlaceBid(data) {
    try {
        let wallet = setUpWallet();

        const contract = setUpContract(process.env.MARKET_PLACE_CONTRACT_ADDRESS, MarketPlace_ABI, wallet);

        const tx = await contract.bidInAuction(data.intiator,data.auctionId, data.bidAmount);
        const receipt = await tx.wait();

        if (receipt.status) {
            return {
                success: true, tx, message: "sent successfully"
            }
        } else {
            return {
                success: false, tx, message: "couldn't complete action"
            }
        }
    } catch (error) {
        console.error(error)
        return {
            success:false, tx: {}, message: error?.reason ?? "error!!!"
        }
    }
}

async function claimMarketPlaceAuction(data) {
    try {
        let wallet = setUpWallet();

        const contract = setUpContract(process.env.MARKET_PLACE_CONTRACT_ADDRESS, MarketPlace_ABI, wallet);

        const tx = await contract.claimAuction(data.intiator,data.auctionId);

        const receipt = await tx.wait();
        if (receipt.status) {
            return {
                success: true, tx, message: "sent successfully"
            }
        } else {
            return {
                success: false, tx, message: "couldn't complete action"
            }
        }
    } catch (error) {
        return {
            success:false, tx: {}, message: error?.reason ?? "error!!!"
        }
    }
}

module.exports = {
    createMarketPlaceListing, 
    performMarketPlaceBid,
    claimMarketPlaceAuction
}