# VeridiaHub Frontend - Web3 Copyright Platform

## 🚀 **Current Status: Production Ready**

VeridiaHub frontend adalah platform Web3 untuk perlindungan hak cipta digital dengan desain modern dan animasi yang menarik.

## ✨ **Features**

### 🎨 **Web3 Design System**
- **Animated Backgrounds**: Particle system, gradient animations, grid patterns
- **Glass Morphism**: Modern glass effects dengan backdrop blur
- **Responsive Design**: Mobile-first dengan optimasi performa
- **Interactive Components**: Hover effects, animations, transitions

### 📱 **Pages (Web3 Style)**
- **Landing Page** (`/`) - Hero section dengan animasi dan testimonials
- **Marketplace** (`/marketplace`) - Grid layout dengan advanced search
- **Upload Artwork** (`/upload`) - Step-by-step upload process
- **IP Registry** (`/ip-registry`) - Advanced search dan filtering

### 🔧 **Technical Stack**
- **React 18** dengan TypeScript
- **Vite** untuk build tool
- **Tailwind CSS** untuk styling
- **Ethers.js v6** untuk Web3 integration
- **Base Network** untuk blockchain

## 🚀 **Quick Start**

### **Installation**
```bash
cd frontend
npm install
```

### **Environment Setup**
```bash
# Auto setup environment
node setup-env.js

# Or manually create .env.local
VITE_RPC_URL=https://mainnet.base.org
VITE_CHAIN_ID=8453
VITE_CONTRACT_ARTWORK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_LICENSE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MARKETPLACE=0x0000000000000000000000000000000000000000
```

### **Development**
```bash
npm run dev
```
**Access**: `http://localhost:5173/`

### **Production Build**
```bash
npm run build
npm run preview
```

## 📁 **Project Structure**

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── AnimatedBackground.tsx    # Web3 animated backgrounds
│   │   ├── Web3Card.tsx             # Web3 card component
│   │   ├── Web3Navbar.tsx           # Web3 navigation
│   │   └── ErrorBoundary.tsx       # Error handling
│   ├── pages/                # Page components
│   │   ├── Web3LandingPage.tsx      # Landing page
│   │   ├── Web3Marketplace.tsx     # Marketplace
│   │   ├── Web3UploadArtwork.tsx    # Upload page
│   │   └── Web3IPRegistry.tsx      # Registry page
│   ├── services/           # On-chain services
│   │   ├── onchainService.ts       # Main service
│   │   ├── artworkService.ts       # Artwork service
│   │   └── onchainTransactionService.ts
│   ├── config/             # Configuration
│   │   ├── contracts.ts            # Contract addresses
│   │   └── environment.ts          # Environment config
│   ├── contexts/           # React contexts
│   │   └── WalletContext.tsx       # Wallet integration
│   ├── styles/             # Custom styles
│   │   └── web3.css               # Web3 animations
│   └── abi/                # Smart contract ABIs
├── setup-env.js           # Environment setup script
└── README.md              # This file
```

## 🎨 **Web3 Components**

### **AnimatedBackground**
```tsx
<AnimatedBackground 
  variant="particles"    // particles, gradient, grid, waves
  intensity="medium"     // low, medium, high
/>
```

### **Web3Card**
```tsx
<Web3Card
  title="Digital Artwork"
  description="Beautiful digital creation"
  price="0.1"
  image="/artwork.jpg"
  creator="0x1234...5678"
  stats={{ views: 100, likes: 25, sales: 5 }}
  tags={['NFT', 'Digital Art']}
  isFeatured={true}
/>
```

### **Web3Navbar**
```tsx
<Web3Navbar 
  onMenuClick={() => {}}
  className="custom-navbar"
/>
```

## 🔗 **Routes**

### **Web3 Routes (Default)**
- `/` - Web3LandingPage
- `/marketplace` - Web3Marketplace
- `/upload` - Web3UploadArtwork
- `/ip-registry` - Web3IPRegistry

### **Classic Routes (Legacy)**
- `/classic` - LandingPage
- `/classic-marketplace` - Marketplace
- `/classic-upload` - UploadArtwork
- `/classic-ip-registry` - IPRegistry

## 🎯 **Key Features**

### **Upload Process**
1. **Drag & Drop** - Intuitive file upload
2. **Form Validation** - Comprehensive details
3. **Progress Tracking** - Real-time feedback
4. **NFT Minting** - Blockchain integration

### **Marketplace**
- **Advanced Search** - Title, description, tags
- **Category Filtering** - Art, music, video, etc.
- **Sort Options** - Newest, price, popular
- **View Modes** - Grid dan list view

### **IP Registry**
- **Hash Verification** - Blockchain hash lookup
- **Status Tracking** - Verified, pending, rejected
- **Type Filtering** - Artwork, music, video, document, code
- **Real-time Stats** - Views, downloads, price

## ⚡ **Performance**

### **Optimizations**
- **Lazy Loading** - Components loaded on demand
- **Animation Controls** - Reduced motion support
- **Particle Limits** - Device-optimized effects
- **Bundle Splitting** - Code splitting for faster loads

### **Accessibility**
- **High Contrast** - Support for high contrast mode
- **Reduced Motion** - Animation controls
- **Screen Readers** - Proper ARIA labels
- **Keyboard Navigation** - Full keyboard support

## 🔧 **Configuration**

### **Environment Variables**
```env
# Network Configuration
VITE_RPC_URL=https://mainnet.base.org
VITE_CHAIN_ID=8453

# Contract Addresses (Update after deployment)
VITE_CONTRACT_ARTWORK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_LICENSE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MARKETPLACE=0x0000000000000000000000000000000000000000
VITE_CONTRACT_MULTISIG=0x0000000000000000000000000000000000000000
VITE_CONTRACT_TIMELOCK=0x0000000000000000000000000000000000000000
VITE_CONTRACT_UPGRADE_PROXY=0x0000000000000000000000000000000000000000
```

### **Animation Settings**
```env
VITE_ANIMATION_INTENSITY=medium
VITE_ENABLE_PARTICLES=true
VITE_GLASS_OPACITY=0.1
```

## 🎨 **Styling System**

### **CSS Classes**
```css
/* Glass Morphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Gradient Text */
.text-gradient {
  background: linear-gradient(45deg, #3B82F6, #8B5CF6, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Animations */
.animate-gradient { animation: gradient-shift 3s ease infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-glow { animation: glow 2s ease-in-out infinite alternate; }
```

## 🚀 **Deployment**

### **Build for Production**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

### **Deploy to Vercel/Netlify**
```bash
# Build output in dist/ folder
# Deploy dist/ folder to your hosting service
```

## 📊 **Current Status**

| Component | Status | Features |
|-----------|--------|----------|
| **Landing Page** | ✅ Complete | Hero, features, testimonials |
| **Marketplace** | ✅ Complete | Search, filter, grid layout |
| **Upload** | ✅ Complete | Step process, drag & drop |
| **Registry** | ✅ Complete | Advanced search, filtering |
| **Web3 Design** | ✅ Complete | Animations, glass morphism |
| **Responsive** | ✅ Complete | Mobile, tablet, desktop |

## 🔗 **Smart Contract Integration**

### **Contract Addresses**
- **Artwork**: `VITE_CONTRACT_ARTWORK`
- **License**: `VITE_CONTRACT_LICENSE`
- **Marketplace**: `VITE_CONTRACT_MARKETPLACE`
- **MultiSig**: `VITE_CONTRACT_MULTISIG`
- **Timelock**: `VITE_CONTRACT_TIMELOCK`
- **UpgradeProxy**: `VITE_CONTRACT_UPGRADE_PROXY`

### **Network Configuration**
- **Network**: Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

## 🎯 **Next Steps**

1. **Deploy Smart Contracts** ke Base mainnet
2. **Update Contract Addresses** di `.env.local`
3. **Test Full Integration** dengan smart contracts
4. **Deploy Frontend** ke production hosting

---

**VeridiaHub Frontend** - Modern Web3 Copyright Platform 🚀✨