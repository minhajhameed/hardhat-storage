const { ethers, run, network } = require("hardhat");

async function main() {
    const SimpleStorageFactory =
        await ethers.getContractFactory("SimpleStorage");
    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deployed();
    console.log(simpleStorage.address);

    if (network.config.chainId === 11155111 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for block confirmations...");

        await simpleStorage.deploymentTransaction().wait(6);
        await verify(simpleStorage.target, []);
    }

    const currentValue = await simpleStorage.retrieve();
    console.log(`1Current v slue is: ${currentValue}`);

    // Update the current value
    const transactionResponse = await simpleStorage.store(7);
    await transactionResponse.wait(6);
    const updatedValue = await simpleStorage.retrieve();
    console.log(`Update value is: ${updatedValue}`);
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
            verify: true,
            constructorArguments: args,
            skipOnRevert: true,
            log: true,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("already verified");
        } else {
            console.log(e);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
