import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, DollarSign, Users, Clock, Check } from 'lucide-react';

const licenses = [
  {
    id: 'commercial',
    name: 'Lisensi Komersial',
    price: '$25',
    description: 'Pembeli dapat menggunakan karya untuk tujuan komersial dengan royalti berkelanjutan.',
    features: [
      'Penggunaan komersial penuh',
      'Royalti 10% per penjualan',
      'Tanpa batasan waktu',
      'Transfer kepemilikan sebagian'
    ],
    icon: <DollarSign className="h-6 w-6" />,
    color: 'from-green-600 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'non-commercial',
    name: 'Lisensi Non-Komersial',
    price: 'Gratis',
    description: 'Penggunaan gratis untuk keperluan non-komersial, pendidikan, dan personal.',
    features: [
      'Penggunaan non-komersial saja',
      'Tanpa royalti',
      'Atribusi wajib',
      'Berbagi dengan lisensi sama'
    ],
    icon: <Users className="h-6 w-6" />,
    color: 'from-blue-600 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'limited',
    name: 'Lisensi Terbatas',
    price: '$15',
    description: 'Lisensi dengan batasan waktu dan jumlah pengguna untuk proyek khusus.',
    features: [
      'Batasan waktu 1 tahun',
      'Maksimal 5 pengguna',
      'Penggunaan komersial terbatas',
      'Royalti 5% per penjualan'
    ],
    icon: <Clock className="h-6 w-6" />,
    color: 'from-orange-600 to-amber-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  }
];

export default function SelectLicense() {
  const [selectedLicense, setSelectedLicense] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleConfirm = async () => {
    if (!selectedLicense) {
      alert('Pilih salah satu lisensi');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setLoading(false);
    alert('Lisensi berhasil dikonfigurasi! Karya Anda siap dipublikasikan.');
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pilih Jenis Lisensi</h1>
        <p className="mt-2 text-gray-600">
          Tentukan bagaimana orang lain dapat menggunakan karya digital Anda
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {licenses.map((license) => (
          <div
            key={license.id}
            className={`relative bg-white rounded-xl p-6 shadow-sm border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedLicense === license.id
                ? `${license.borderColor} ring-2 ring-offset-2 ring-blue-500`
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedLicense(license.id)}
          >
            {selectedLicense === license.id && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}

            <div className={`inline-flex items-center justify-center p-3 rounded-lg mb-4 ${license.bgColor}`}>
              <div className={`text-transparent bg-gradient-to-r ${license.color} bg-clip-text`}>
                {license.icon}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {license.name}
              </h3>
              <div className={`inline-block px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r ${license.color}`}>
                {license.price}
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              {license.description}
            </p>

            <ul className="space-y-2">
              {license.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleConfirm}
          disabled={!selectedLicense || loading}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-red-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
        >
          {loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Mengkonfirmasi...
            </div>
          ) : (
            'Konfirmasi Lisensi'
          )}
        </button>
      </div>
    </div>
  );
}