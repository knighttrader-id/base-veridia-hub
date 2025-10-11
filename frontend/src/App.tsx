import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import Web3LandingPage from './pages/Web3LandingPage';
import LandingPage from './pages/LandingPage';
import Web3UploadArtwork from './pages/Web3UploadArtwork';
import UploadArtwork from './pages/UploadArtwork';
import SelectLicense from './pages/SelectLicense';
import Web3Marketplace from './pages/Web3Marketplace';
import Marketplace from './pages/Marketplace';
import PurchaseConfirmation from './pages/PurchaseConfirmation';
import Web3IPRegistry from './pages/Web3IPRegistry';
import IPRegistry from './pages/IPRegistry';
import Layout from './components/Layout';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Web3LandingPage />} />
            <Route path="/classic" element={<LandingPage />} />
            <Route path="/upload" element={<Web3UploadArtwork />} />
            <Route path="/classic-upload" element={
              <Layout>
                <UploadArtwork />
              </Layout>
            } />
            <Route path="/select-license" element={
              <Layout>
                <SelectLicense />
              </Layout>
            } />
            <Route path="/marketplace" element={<Web3Marketplace />} />
            <Route path="/classic-marketplace" element={
              <Layout>
                <Marketplace />
              </Layout>
            } />
            <Route path="/purchase/:id" element={
              <Layout>
                <PurchaseConfirmation />
              </Layout>
            } />
            <Route path="/ip-registry" element={<Web3IPRegistry />} />
            <Route path="/classic-ip-registry" element={
              <Layout>
                <IPRegistry />
              </Layout>
            } />
          </Routes>
        </Router>
      </WalletProvider>
    </ErrorBoundary>
  );
}

export default App;