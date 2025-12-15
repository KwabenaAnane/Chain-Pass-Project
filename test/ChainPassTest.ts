import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

module.exports = buildModule("ChainPassModule", (m) => {
  
  // Deploy ChainPass
  const chainpass = m.contract("ChainPass", []);

  // Set base URI immediately
  m.call(chainpass, "setURI", ["ipfs://bafybei.../"], {
    id: "set_base_uri"
  });

  return { chainpass };
});
