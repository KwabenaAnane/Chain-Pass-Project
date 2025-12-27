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

  
  // ---------------- Event Registration ----------------
  describe("Event Registration", () => {
    async function openEvent() {
      const { chainpass, organizer, user1, user2 } = await deployChainPass();
      const deadline = await futureDeadline();
      await chainpass.connect(organizer).createEvent(
        "Test Event",
        ethers.parseEther("0.1"),
        2,
        deadline
      );
      await chainpass.connect(organizer).openRegistration(1);
      return { chainpass, organizer, user1, user2 };
    }

    it("should allow users to register and mint NFT", async () => {
      const { chainpass, user1 } = await openEvent();
      const fee = ethers.parseEther("0.1");

      await chainpass.connect(user1).registerForEvent(1, { value: fee });

      const registered = await chainpass.isRegistered(1, user1.address);
      expect(registered).to.be.true;

      const balance = await chainpass.balanceOf(user1.address, 1);
      expect(balance).to.equal(1);
    });

    it("should revert on incorrect fee", async () => {
      const { chainpass, user1 } = await openEvent();
      await expect(
        chainpass.connect(user1).registerForEvent(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWithCustomError(chainpass, "IncorrectFee");
    });

    it("should revert if event is full", async () => {
      const { chainpass, organizer, user1, user2 } = await openEvent();
      const fee = ethers.parseEther("0.1");

      await chainpass.connect(user1).registerForEvent(1, { value: fee });
      await chainpass.connect(user2).registerForEvent(1, { value: fee });

      const [, , user3] = await ethers.getSigners();
      await expect(
        chainpass.connect(user3).registerForEvent(1, { value: fee })
      ).to.be.revertedWithCustomError(chainpass, "EventFull");
    });
  });

  // ---------------- Cancel Registration ----------------
  describe("Cancel Registration", () => {
    async function registeredUser() {
      const { chainpass, organizer, user1, user2 } = await deployChainPass();
      await chainpass.connect(organizer).createEvent(
        "Cancel Test",
        ethers.parseEther("0.1"),
        10,
        await futureDeadline()
      );
      await chainpass.connect(organizer).openRegistration(1);
      await chainpass.connect(user1).registerForEvent(1, { value: ethers.parseEther("0.1") });
      return { chainpass, organizer, user1, user2 };
    }

    it("should cancel registration and burn NFT", async () => {
      const { chainpass, user1 } = await registeredUser();

      const balanceBefore = await chainpass.balanceOf(user1.address, 1);
      expect(balanceBefore).to.equal(1);

      await chainpass.connect(user1).cancelRegistration(1);

      const balanceAfter = await chainpass.balanceOf(user1.address, 1);
      expect(balanceAfter).to.equal(0);

      const registered = await chainpass.isRegistered(1, user1.address);
      expect(registered).to.be.false;
    });

    it("should revert if cancellation after deadline", async () => {
      const { chainpass, user1 } = await registeredUser();

      // increase blockchain timestamp past deadline
      await ethers.provider.send("evm_increaseTime", [90000]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        chainpass.connect(user1).cancelRegistration(1)
      ).to.be.revertedWithCustomError(chainpass, "CannotCancelAfterDeadline");
    });
  });

  // ---------------- Withdraw Funds ----------------
  describe("Withdraw Funds", () => {
    async function eventWithUsers() {
      const { chainpass, organizer, user1, user2 } = await deployChainPass();
      await chainpass.connect(organizer).createEvent(
        "Withdraw Test",
        ethers.parseEther("0.1"),
        10,
        await futureDeadline()
      );
      await chainpass.connect(organizer).openRegistration(1);
      await chainpass.connect(user1).registerForEvent(1, { value: ethers.parseEther("0.1") });
      await chainpass.connect(user2).registerForEvent(1, { value: ethers.parseEther("0.1") });
      return { chainpass, organizer, user1, user2 };
    }

    it("should allow organizer to withdraw funds after deadline", async () => {
      const { chainpass, organizer } = await eventWithUsers();

      await ethers.provider.send("evm_increaseTime", [90000]);
      await ethers.provider.send("evm_mine", []);

      const balanceBefore = await ethers.provider.getBalance(organizer.address);

      await chainpass.connect(organizer).withdrawFunds(1);

      const balanceAfter = await ethers.provider.getBalance(organizer.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("should revert if non-organizer tries to withdraw", async () => {
      const { chainpass, user1 } = await eventWithUsers();

      await ethers.provider.send("evm_increaseTime", [90000]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        chainpass.connect(user1).withdrawFunds(1)
      ).to.be.revertedWithCustomError(chainpass, "OnlyOrganizer");
    });
  });

  // ---------------- URI ----------------
  describe("URI", () => {
    it("should set and get correct token URI", async () => {
      const { chainpass, owner } = await deployChainPass();
      await chainpass.connect(owner).setURI("ipfs://QmTest/");
      const uri = await chainpass.uri(1);
      expect(uri).to.equal("ipfs://QmTest/1.json");
    });

    it("should revert if non-owner tries to set URI", async () => {
      const { chainpass, user1 } = await deployChainPass();
      await expect(chainpass.connect(user1).setURI("ipfs://QmTest/")).to.be.reverted;
    });
  });

});