# VeridiaHub Frontend Setup

## 🚀 **Quick Setup**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Setup Environment**
```bash
# Auto setup (recommended)
node setup-env.js

# Or manually create .env.local
cp .env.example .env.local
```

### **3. Start Development**
```bash
npm run dev
```

**Access**: `http://localhost:5173/`

## 🔧 **Environment Variables**

### **Required Variables**
```env
VITE_RPC_URL=https://mainnet.base.org
VITE_CHAIN_ID=8453
```

### **Contract Addresses** (Update after deployment)
```env
VITE_CONTRACT_ARTWORK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_LICENSE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MARKETPLACE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MULTISIG=0x0000000000000000000000000000000000000000
VITE_CONTRACT_TIMELOCK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_UPGRADE_PROXY=0x0000000000000000000000000000000000000000
```

## 📱 **Available Routes**

- `/` - Web3 Landing Page
- `/marketplace` - Web3 Marketplace
- `/upload` - Web3 Upload Artwork
- `/ip-registry` - Web3 IP Registry

## 🎨 **Features**

- ✅ Web3 Design System
- ✅ Animated Backgrounds
- ✅ Glass Morphism Effects
- ✅ Responsive Design
- ✅ Wallet Integration
- ✅ Smart Contract Integration

## 🚀 **Production Build**

```bash
npm run build
npm run preview
```

---

**Ready to go!** 🚀
