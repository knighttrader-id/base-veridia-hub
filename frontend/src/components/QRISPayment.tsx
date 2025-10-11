import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { CheckCircle, Clock, X, Copy, Smartphone } from 'lucide-react';

interface QRISPaymentProps {
  amount: number;
  orderId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function QRISPayment({ amount, orderId, onSuccess, onCancel }: QRISPaymentProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'checking' | 'success' | 'expired'>('pending');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [paymentId] = useState(`QRIS-${Date.now()}`);

  // Generate QRIS QR Code
  useEffect(() => {
    generateQRCode();
    startPaymentTimer();
  }, []);

  const generateQRCode = async () => {
    // QRIS format: 00020101021226{merchant_info}5204{category}5303360540{amount}5802ID5909{merchant}6006{city}62{additional}6304{crc}
    const qrisData = `00020101021226580014ID.CO.NUSACIPTA.WWW0118${orderId}52045814530336054${String(amount * 15000).padStart(2, '0')}5802ID5913NUSACIPTA PLT6007JAKARTA62070503***63044B2A`;
    
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(qrisData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const startPaymentTimer = () => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate payment checking
    setTimeout(() => {
      setPaymentStatus('checking');
      setTimeout(() => {
        setPaymentStatus('success');
        onSuccess();
      }, 3000);
    }, 10000); // Simulate payment after 10 seconds for demo
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount * 15000);
  };

  const copyPaymentId = () => {
    navigator.clipboard.writeText(paymentId);
    alert('Payment ID disalin ke clipboard!');
  };

  if (paymentStatus === 'success') {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Berhasil!</h3>
        <p className="text-gray-600 mb-4">
          Pembayaran QRIS sebesar {formatCurrency(amount)} telah berhasil diproses.
        </p>
        <p className="text-sm text-gray-500">Payment ID: {paymentId}</p>
      </div>
    );
  }

  if (paymentStatus === 'expired') {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <X className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran Kedaluwarsa</h3>
        <p className="text-gray-600 mb-4">
          Waktu pembayaran telah habis. Silakan coba lagi.
        </p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Pembayaran QRIS</h3>
        <p className="text-gray-600">Scan QR code dengan aplikasi e-wallet Anda</p>
      </div>

      {/* Payment Details */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Jumlah Pembayaran:</span>
          <span className="font-bold text-lg text-gray-900">{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Order ID:</span>
          <span className="font-mono text-sm text-gray-900">{orderId}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Payment ID:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-sm text-gray-900">{paymentId}</span>
            <button
              onClick={copyPaymentId}
              className="text-blue-600 hover:text-blue-800"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6 text-center">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt="QRIS QR Code" className="mx-auto mb-4" />
        ) : (
          <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {paymentStatus === 'checking' ? (
          <div className="flex items-center justify-center text-blue-600">
            <Clock className="h-5 w-5 mr-2 animate-pulse" />
            <span>Mengecek pembayaran...</span>
          </div>
        ) : (
          <div className="text-gray-600">
            <p className="mb-2">Waktu tersisa: <span className="font-bold text-red-600">{formatTime(timeLeft)}</span></p>
            <p className="text-sm">Scan dengan GoPay, OVO, DANA, LinkAja, atau aplikasi e-wallet lainnya</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Cara Pembayaran:</h4>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Buka aplikasi e-wallet Anda (GoPay, OVO, DANA, dll)</li>
          <li>2. Pilih menu "Scan QR" atau "Bayar"</li>
          <li>3. Arahkan kamera ke QR code di atas</li>
          <li>4. Konfirmasi pembayaran di aplikasi Anda</li>
          <li>5. Tunggu konfirmasi pembayaran berhasil</li>
        </ol>
      </div>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Batalkan Pembayaran
      </button>
    </div>
  );
}