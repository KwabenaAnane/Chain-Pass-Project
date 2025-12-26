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

  
  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);
      
      const eventName = "Blockchain Conference";
      const fee = ethers.parseEther("0.1");
      const maxParticipants = 100;
      const deadline = (await time.latest()) + 86400; // +1 day

      await expect(
        chainpass.connect(organizer).createEvent(eventName, fee, maxParticipants, deadline)
      ).to.emit(chainpass, "EventCreated")
        .withArgs(1, eventName, organizer.address, fee, maxParticipants, deadline);

      expect(await chainpass.eventCounter()).to.equal(1);
    });

    it("Should revert if max participants is zero", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);
      
      const deadline = (await time.latest()) + 86400;
      
      await expect(
        chainpass.connect(organizer).createEvent("Test", ethers.parseEther("0.1"), 0, deadline)
      ).to.be.revertedWithCustomError(chainpass, "InvalidMaxParticipants");
    });

    it("Should revert if deadline is in the past", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);
      
      const pastDeadline = (await time.latest()) - 1000;
      
      await expect(
        chainpass.connect(organizer).createEvent("Test", ethers.parseEther("0.1"), 100, pastDeadline)
      ).to.be.revertedWithCustomError(chainpass, "DeadlineMustBeFuture");
    });

    it("Should create event with registration closed by default", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);
      
      const deadline = (await time.latest()) + 86400;
      await chainpass.connect(organizer).createEvent("Test", ethers.parseEther("0.1"), 100, deadline);
      
      const event = await chainpass.getEventDetails(1);
      expect(event.isOpen).to.be.false;
    });
  });











});