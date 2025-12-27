import { expect } from "chai";
import { ethers } from "hardhat-ethers";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";

describe("ChainPass", function () {

  //FIXTURE

  async function deployChainPassFixture() {
    const [owner, organizer, user1, user2] = await ethers.getSigners();

    const ChainPass = await ethers.getContractFactory("ChainPass");
    const chainpass = await ChainPass.deploy();
    await chainpass.waitForDeployment();

    return { chainpass, owner, organizer, user1, user2 };
  }

  async function createEvent(chainpass: any, organizer: any) {
    const deadline = (await time.latest()) + 86400;

    await chainpass.connect(organizer).createEvent(
      "Test Event",
      ethers.parseEther("0.1"),
      10,
      deadline
    );

    return deadline;
  }

  async function createAndOpenEvent(chainpass: any, organizer: any) {
    const deadline = await createEvent(chainpass, organizer);
    await chainpass.connect(organizer).openRegistration(1);
    return deadline;
  }

  //EVENT CREATION
  describe("Event Creation", function () {
    it("creates an event successfully", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);
      const deadline = await createEvent(chainpass, organizer);

      await expect(
        chainpass.connect(organizer).createEvent(
          "Blockchain Conference",
          ethers.parseEther("0.1"),
          100,
          deadline + 1000
        )
      ).to.emit(chainpass, "EventCreated");

      expect(await chainpass.eventCounter()).to.equal(2);
    });

    it("reverts if max participants is zero", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);

      await expect(
        chainpass.connect(organizer).createEvent(
          "Invalid",
          ethers.parseEther("0.1"),
          0,
          (await time.latest()) + 100
        )
      ).to.be.revertedWithCustomError(chainpass, "InvalidMaxParticipants");
    });

    it("reverts if deadline is in the past", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);

      await expect(
        chainpass.connect(organizer).createEvent(
          "Invalid",
          ethers.parseEther("0.1"),
          10,
          (await time.latest()) - 1
        )
      ).to.be.revertedWithCustomError(chainpass, "DeadlineMustBeFuture");
    });
  });

  //REGISTRATION MANAGEMENT

  describe("Registration Management", function () {
    it("opens and closes registration", async function () {
      const { chainpass, organizer } = await loadFixture(deployChainPassFixture);
      await createEvent(chainpass, organizer);

      await chainpass.connect(organizer).openRegistration(1);
      expect((await chainpass.getEventDetails(1)).isOpen).to.equal(true);

      await chainpass.connect(organizer).closeRegistration(1);
      expect((await chainpass.getEventDetails(1)).isOpen).to.equal(false);
    });

    it("prevents non-organizer from managing registration", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      await createEvent(chainpass, organizer);

      await expect(
        chainpass.connect(user1).openRegistration(1)
      ).to.be.revertedWithCustomError(chainpass, "OnlyOrganizer");
    });
  });









})