import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("ChainPass", function () {

  // ---------------- Helper: Deploy contract ----------------
  async function deployChainPass() {
    const [owner, organizer, user1, user2] = await ethers.getSigners();

    const ChainPass = await ethers.getContractFactory("ChainPass");
    const chainpass = await ChainPass.deploy();
    await chainpass.waitForDeployment();

    return { chainpass, owner, organizer, user1, user2 };
  }

  // ---------------- Helper: future deadline ----------------
  async function futureDeadline(seconds = 86400) {
    const block = await ethers.provider.getBlock("latest");
    return block!.timestamp + seconds;
  }

  // ---------------- Deployment ----------------
  describe("Deployment", () => {
    it("should set the right owner", async () => {
      const { chainpass, owner } = await deployChainPass();
      expect(await chainpass.owner()).to.equal(owner.address);
    });

    it("should start with zero events", async () => {
      const { chainpass } = await deployChainPass();
      expect(await chainpass.eventCounter()).to.equal(0);
    });
  });

  // ---------------- Event Creation ----------------
  describe("Event Creation", () => {
    it("should create an event successfully", async () => {
      const { chainpass, organizer } = await deployChainPass();
      const deadline = await futureDeadline();

      await expect(
        chainpass.connect(organizer).createEvent(
          "Blockchain Conf",
          ethers.parseEther("0.1"),
          100,
          deadline
        )
      ).to.emit(chainpass, "EventCreated");

      const event = await chainpass.getEventDetails(1);
      expect(event.organizer).to.equal(organizer.address);
      expect(event.isOpen).to.be.false;
    });

    it("should revert if max participants is zero", async () => {
      const { chainpass, organizer } = await deployChainPass();
      const deadline = await futureDeadline();

      await expect(
        chainpass.connect(organizer).createEvent(
          "Invalid",
          ethers.parseEther("0.1"),
          0,
          deadline
        )
      ).to.be.revertedWithCustomError(chainpass, "InvalidMaxParticipants");
    });

    it("should revert if deadline is in the past", async () => {
      const { chainpass, organizer } = await deployChainPass();
      const block = await ethers.provider.getBlock("latest");
      const pastDeadline = block!.timestamp - 1000;

      await expect(
        chainpass.connect(organizer).createEvent(
          "Past",
          ethers.parseEther("0.1"),
          10,
          pastDeadline
        )
      ).to.be.revertedWithCustomError(chainpass, "DeadlineMustBeFuture");
    });
  });

  // ---------------- Registration Management ----------------
  describe("Registration Management", () => {
    async function createEventWithOrganizer() {
      const { chainpass, organizer, user1, user2 } = await deployChainPass();
      const deadline = await futureDeadline();
      await chainpass.connect(organizer).createEvent(
        "Test Event",
        ethers.parseEther("0.1"),
        10,
        deadline
      );
      return { chainpass, organizer, user1, user2 };
    }

    it("should allow organizer to open and close registration", async () => {
      const { chainpass, organizer } = await createEventWithOrganizer();

      await chainpass.connect(organizer).openRegistration(1);
      let event = await chainpass.getEventDetails(1);
      expect(event.isOpen).to.be.true;

      await chainpass.connect(organizer).closeRegistration(1);
      event = await chainpass.getEventDetails(1);
      expect(event.isOpen).to.be.false;
    });

    it("should revert if non-organizer tries to open registration", async () => {
      const { chainpass, user1 } = await createEventWithOrganizer();

      await expect(
        chainpass.connect(user1).openRegistration(1)
      ).to.be.revertedWithCustomError(chainpass, "OnlyOrganizer");
    });

    it("should revert when opening already open registration", async () => {
      const { chainpass, organizer } = await createEventWithOrganizer();
      await chainpass.connect(organizer).openRegistration(1);

      await expect(
        chainpass.connect(organizer).openRegistration(1)
      ).to.be.revertedWithCustomError(chainpass, "RegistrationAlreadyOpen");
    });
  });