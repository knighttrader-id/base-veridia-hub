import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, CheckCircle, ArrowLeft, Wallet } from 'lucide-react';
import QRISPayment from '../components/QRISPayment';
import { useWallet } from '../contexts/WalletContext';

// Mock artwork data - in real app, this would come from API
const getArtworkById = (id: string) => {
  const artworks: { [key: string]: any } = {
    '1': {
      title: 'Abstract Digital Art Collection',
      creator: 'Alex Turner',
      price: 25,
      license: 'Komersial',
      thumbnail: 'https://images.pexels.com/photos/1742370/pexels-photo-1742370.jpeg?w=300&h=200&fit=crop'
    },
    '2': {
      title: 'Ambient Soundscape Track',
      creator: 'Sarah Music',
      price: 0,
      license: 'Non-Komersial',
      thumbnail: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?w=300&h=200&fit=crop'
    }
  };
  return artworks[id];
};

export default function PurchaseConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showQRIS, setShowQRIS] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { isConnected, connectWallet } = useWallet();

  const artwork = getArtworkById(id || '1');

  if (!artwork) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Karya tidak ditemukan</h2>
        <button 
          onClick={() => navigate('/marketplace')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Kembali ke Marketplace
        </button>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert('Pilih metode pembayaran');
      return;
    }

    if (paymentMethod === 'qris') {
      setShowQRIS(true);
      return;
    }

    if (paymentMethod === 'crypto' && !isConnected) {
      await connectWallet();
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    setProcessing(false);
    setCompleted(true);
  };

  const handleQRISSuccess = () => {
    setShowQRIS(false);
    setCompleted(true);
  };

  const handleQRISCancel = () => {
    setShowQRIS(false);
    setPaymentMethod('');
  };

  if (showQRIS) {
    return (
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={handleQRISCancel}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Kembali ke Pilihan Pembayaran
        </button>
        <QRISPayment
          amount={artwork.price}
          orderId={`ORDER-${id}-${Date.now()}`}
          onSuccess={handleQRISSuccess}
          onCancel={handleQRISCancel}
        />
      </div>
    );
  }

  if (completed) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-600 mb-6">
            Lisensi untuk "{artwork.title}" telah berhasil dibeli. 
            Anda akan menerima email konfirmasi dan sertifikat digital.
          </p>
          <button
            onClick={() => navigate('/marketplace')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-red-700 transition-colors"
          >
            Kembali ke Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button 
        onClick={() => navigate('/marketplace')}
        className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Kembali ke Marketplace
      </button>

      <div className="space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ringkasan Pembelian</h2>
          
          <div className="flex items-start space-x-4">
            <img 
              src={artwork.thumbnail} 
              alt={artwork.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{artwork.title}</h3>
              <p className="text-gray-600 text-sm">oleh {artwork.creator}</p>
              <p className="text-gray-600 text-sm">Lisensi: {artwork.license}</p>
              <div className="mt-2 text-xl font-bold text-gray-900">
                {artwork.price === 0 ? 'Gratis' : `$${artwork.price}`}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        {artwork.price > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Metode Pembayaran</h2>
            
            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod('qris')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'qris'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg mr-3">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">QRIS</div>
                    <div className="text-sm text-gray-600">Bayar dengan scan QR code</div>
                  </div>
                  {paymentMethod === 'qris' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('va')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'va'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg mr-3">
                    <CreditCard className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Virtual Account</div>
                    <div className="text-sm text-gray-600">Transfer bank virtual account</div>
                  </div>
                  {paymentMethod === 'va' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>

              <div
                onClick={() => setPaymentMethod('crypto')}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg mr-3">
                    <Wallet className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Crypto Wallet</div>
                    <div className="text-sm text-gray-600">Bayar dengan ETH/MATIC/BNB</div>
                  </div>
                  {paymentMethod === 'crypto' && (
                    <div className="ml-auto">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Button */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <button
            onClick={handlePayment}
            disabled={artwork.price > 0 && !paymentMethod || processing}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {processing ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Memproses Pembayaran...
              </div>
            ) : artwork.price === 0 ? (
              'Dapatkan Lisensi Gratis'
            ) : (
              paymentMethod === 'qris' ? 'Bayar dengan QRIS' :
              paymentMethod === 'crypto' ? (isConnected ? 'Bayar dengan Crypto' : 'Hubungkan Wallet') :
              `Bayar $${artwork.price}`
            )}
          </button>

          <p className="mt-3 text-xs text-gray-500 text-center">
            Dengan melanjutkan, Anda menyetujui syarat dan ketentuan penggunaan lisensi.
          </p>
        </div>
      </div>
    </div>
  );
}