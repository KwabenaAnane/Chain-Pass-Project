import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, time }  from "@nomicfoundation/hardhat-network-helpers";
import { ChainPass } from "../typechain-types";

describe("ChainPass", function () {
  
  async function deployChainPassFixture() {
    const [owner, organizer, user1, user2] = await ethers.getSigners();
    
    const ChainPass = await ethers.getContractFactory("ChainPass");
    const chainpass = await ChainPass.deploy();
    
    return { chainpass, owner, organizer, user1, user2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { chainpass, owner } = await loadFixture(deployChainPassFixture);
      expect(await chainpass.owner()).to.equal(owner.address);
    });

    it("Should start with zero events", async function () {
      const { chainpass } = await loadFixture(deployChainPassFixture);
      expect(await chainpass.eventCounter()).to.equal(0);
    });
  });











});