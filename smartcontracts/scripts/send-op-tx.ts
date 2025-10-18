const { network } = require("hardhat");

async function main() {
  console.log("This script is for OP chain testing but may not be compatible with current setup");
  console.log("Consider using the standard deployment scripts instead");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
