import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("ChainPassModule", (m) => {

    // Deploy ChainPass contract
    const chainpass = m.contract("ChainPass", []);

    // Base URI with IPFS folder CID from pinata.cloud
    m.call(chainpass, "setURI", ["ipfs://bafybeieqwgqtglofddadauxepj5v4awq5yx5ghgrhai2c4eihpp3uycdy4/"], {
        id: "set_base_uri"
    });

    return { chainpass };
});