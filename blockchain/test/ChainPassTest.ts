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

  //EVENT REGISTRATION

  describe("Event Registration", function () {
    it("registers user and mints NFT", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      await createAndOpenEvent(chainpass, organizer);

      await expect(
        chainpass.connect(user1).registerForEvent(1, {
          value: ethers.parseEther("0.1"),
        })
      ).to.emit(chainpass, "Registered");

      expect(await chainpass.balanceOf(user1.address, 1)).to.equal(1);
      expect(await chainpass.isRegistered(1, user1.address)).to.equal(true);
    });

    it("reverts on incorrect fee", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      await createAndOpenEvent(chainpass, organizer);

      await expect(
        chainpass.connect(user1).registerForEvent(1, {
          value: ethers.parseEther("0.05"),
        })
      ).to.be.revertedWithCustomError(chainpass, "IncorrectFee");
    });

    it("enforces max participants", async function () {
      const { chainpass, organizer, user1, user2 } = await loadFixture(deployChainPassFixture);

      const deadline = (await time.latest()) + 1000;
      await chainpass.connect(organizer).createEvent(
        "Limited",
        ethers.parseEther("0.1"),
        1,
        deadline
      );
      await chainpass.connect(organizer).openRegistration(1);

      await chainpass.connect(user1).registerForEvent(1, { value: ethers.parseEther("0.1") });

      await expect(
        chainpass.connect(user2).registerForEvent(1, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWithCustomError(chainpass, "EventFull");
    });
  });

  //CANCEL REGISTRATION

  describe("Cancel Registration", function () {
    it("cancels registration, burns NFT and refunds", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      await createAndOpenEvent(chainpass, organizer);

      await chainpass.connect(user1).registerForEvent(1, {
        value: ethers.parseEther("0.1"),
      });

      await expect(
        chainpass.connect(user1).cancelRegistration(1)
      ).to.emit(chainpass, "RegistrationCancelled");

      expect(await chainpass.balanceOf(user1.address, 1)).to.equal(0);
    });

    it("reverts cancellation after deadline", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      const deadline = await createAndOpenEvent(chainpass, organizer);

      await chainpass.connect(user1).registerForEvent(1, {
        value: ethers.parseEther("0.1"),
      });

      await time.increaseTo(deadline + 1);

      await expect(
        chainpass.connect(user1).cancelRegistration(1)
      ).to.be.revertedWithCustomError(chainpass, "CannotCancelAfterDeadline");
    });
  });

                //WITHDRAW FUNDS

                 describe("Cancel Registration", function () {
    it("cancels registration, burns NFT and refunds", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      await createAndOpenEvent(chainpass, organizer);

      await chainpass.connect(user1).registerForEvent(1, {
        value: ethers.parseEther("0.1"),
      });

      await expect(
        chainpass.connect(user1).cancelRegistration(1)
      ).to.emit(chainpass, "RegistrationCancelled");

      expect(await chainpass.balanceOf(user1.address, 1)).to.equal(0);
    });

    it("reverts cancellation after deadline", async function () {
      const { chainpass, organizer, user1 } = await loadFixture(deployChainPassFixture);
      const deadline = await createAndOpenEvent(chainpass, organizer);

      await chainpass.connect(user1).registerForEvent(1, {
        value: ethers.parseEther("0.1"),
      });

      await time.increaseTo(deadline + 1);

      await expect(
        chainpass.connect(user1).cancelRegistration(1)
      ).to.be.revertedWithCustomError(chainpass, "CannotCancelAfterDeadline");
    });
  });

            //URI METADATA
             describe("URI", function () {
    it("sets and returns correct token URI", async function () {
      const { chainpass, owner } = await loadFixture(deployChainPassFixture);

      await chainpass.connect(owner).setURI("ipfs://QmTest/");
      expect(await chainpass.uri(1)).to.equal("ipfs://QmTest/1.json");
    });
  });
})