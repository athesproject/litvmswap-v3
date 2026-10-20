// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting Uniswap V3 deployment...\n");
  
  // Sepolia addresses
  const WETH9 = "0x315374AA9b5536037Cc1Efeea2439CCC0913A77e";
  const FACTORY = "0xDE6763A041f8Fc94CA2EE5933736F78f6D1A11c5";
  
  try {
    // Get signer
    const [deployer] = await ethers.getSigners();
    console.log("📡 Network: sepolia");
    console.log("👤 Deployer:", deployer.address);
    
    // Test connection
    console.log("Testing connection...");
    const provider = ethers.provider;
    const network = await provider.getNetwork();
    console.log("✅ Connected to chain:", network.chainId);
    
    // Check balance
    const balance = await provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (balance.lt(ethers.utils.parseEther("0.01"))) {
      throw new Error("Low balance. Get Sepolia ETH from a faucet");
    }
    
    console.log("\n" + "=".repeat(50));
    console.log("Starting deployment...");
    console.log("=".repeat(50) + "\n");
    
    // Step 1: Deploy NFTDescriptor
    console.log("1. Deploying NFTDescriptor...");
    const NFTDescriptor = await ethers.getContractFactory("NFTDescriptor");
    const nftDescriptor = await NFTDescriptor.deploy();
    await nftDescriptor.deployTransaction.wait(1);
    console.log("   ✅ Address:", nftDescriptor.address);
    console.log("   📝 TX Hash:", nftDescriptor.deployTransaction.hash);
    
    // Step 2: Deploy NonfungibleTokenPositionDescriptor
    console.log("\n2. Deploying NonfungibleTokenPositionDescriptor...");
    const NonfungibleTokenPositionDescriptor = await ethers.getContractFactory(
      "NonfungibleTokenPositionDescriptor",
      { libraries: { NFTDescriptor: nftDescriptor.address } }
    );
    
    const nftPositionDescriptor = await NonfungibleTokenPositionDescriptor.deploy(
      WETH9,
      ethers.utils.formatBytes32String("ETH")
    );
    await nftPositionDescriptor.deployTransaction.wait(1);
    console.log("   ✅ Address:", nftPositionDescriptor.address);
    console.log("   📝 TX Hash:", nftPositionDescriptor.deployTransaction.hash);
    
    // Step 3: Deploy NonfungiblePositionManager
    console.log("\n3. Deploying NonfungiblePositionManager...");
    const NonfungiblePositionManager = await ethers.getContractFactory("NonfungiblePositionManager");
    const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(
      FACTORY,
      WETH9,
      nftPositionDescriptor.address
    );
    await nonfungiblePositionManager.deployTransaction.wait(1);
    console.log("   ✅ Address:", nonfungiblePositionManager.address);
    console.log("   📝 TX Hash:", nonfungiblePositionManager.deployTransaction.hash);
    
    // Step 4: Deploy SwapRouter
    console.log("\n4. Deploying SwapRouter...");
    const SwapRouter = await ethers.getContractFactory("SwapRouter");
    const swapRouter = await SwapRouter.deploy(FACTORY, WETH9);
    await swapRouter.deployTransaction.wait(1);
    console.log("   ✅ Address:", swapRouter.address);
    console.log("   📝 TX Hash:", swapRouter.deployTransaction.hash);
    
    // Step 5: Deploy V3Migrator
    console.log("\n5. Deploying V3Migrator...");
    const V3Migrator = await ethers.getContractFactory("V3Migrator");
    const v3Migrator = await V3Migrator.deploy(
      FACTORY,
      WETH9,
      nonfungiblePositionManager.address
    );
    await v3Migrator.deployTransaction.wait(1);
    console.log("   ✅ Address:", v3Migrator.address);
    console.log("   📝 TX Hash:", v3Migrator.deployTransaction.hash);
    
    // Success
    console.log("\n" + "=".repeat(50));
    console.log("🎉 DEPLOYMENT COMPLETE!");
    console.log("=".repeat(50));
    console.log("\n📊 Summary:");
    console.log("-".repeat(40));
    console.log("NFTDescriptor:", nftDescriptor.address);
    console.log("NonfungibleTokenPositionDescriptor:", nftPositionDescriptor.address);
    console.log("NonfungiblePositionManager:", nonfungiblePositionManager.address);
    console.log("SwapRouter:", swapRouter.address);
    console.log("V3Migrator:", v3Migrator.address);
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    
    if (error.message.includes("network") || error.message.includes("timeout")) {
      console.log("\n🔧 Try these fixes:");
      console.log("1. Update SEPOLIA_RPC_URL in .env file");
      console.log("2. Use a different RPC provider");
      console.log("3. Check your internet connection");
    }
    
    process.exit(1);
  }
}

main();