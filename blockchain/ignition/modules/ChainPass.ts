import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ChainPassModule", (m) => {

    // Deploy ChainPass contract
    const chainpass = m.contract("ChainPass", []);

    // Optionally set URI during deployment (if you want)
    // m.call(chainpass, "setURI", ["ipfs://bafybeieqwgqtglofddadauxepj5v4awq5yx5ghgrhai2c4eihpp3uycdy4/"]);

    return { chainpass };
});