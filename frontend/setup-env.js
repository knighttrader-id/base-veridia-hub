#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envContent = `# VeridiaHub Frontend Environment Configuration
# Base Network Configuration
VITE_RPC_URL=https://mainnet.base.org
VITE_CHAIN_ID=8453

# Smart Contract Addresses (Update after deployment to Base mainnet)
VITE_CONTRACT_ARTWORK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_LICENSE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MARKETPLACE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MULTISIG=0x0000000000000000000000000000000000000000
VITE_CONTRACT_TIMELOCK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_UPGRADE_PROXY=0x0000000000000000000000000000000000000000

# IPFS Configuration
VITE_IPFS_GATEWAY=https://ipfs.io/ipfs/

# Application Configuration
VITE_APP_NAME=VeridiaHub
VITE_APP_DESCRIPTION=Enterprise-Ready Copyright Platform for Indonesian Creators
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_UPLOAD_ENDPOINT=/api/upload
VITE_HASH_ENDPOINT=/api/hash
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
  console.log('📝 You can edit it manually if needed');
} else {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  console.log('🔧 Environment variables configured for development');
  console.log('📝 Update contract addresses after deployment');
}

console.log('\n🚀 Next steps:');
console.log('1. Restart the development server: npm run dev');
console.log('2. Deploy smart contracts to Base mainnet');
console.log('3. Update contract addresses in .env.local');
console.log('4. Test full integration');
