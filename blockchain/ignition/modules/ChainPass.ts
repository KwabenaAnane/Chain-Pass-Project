import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ChainPassModule", (m) => {

    // Deploy ChainPass contract
    const chainpass = m.contract("ChainPass", []);

    //pinata.cloud ipfs
    m.call(chainpass, "setURI", ["ipfs://bafybeib5qzjial3k24hjhq3cezn2d4l4wwvvp2zifpj3secyoaafgu4upu/"]);

    return { chainpass };
});