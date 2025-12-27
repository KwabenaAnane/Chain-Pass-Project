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










})