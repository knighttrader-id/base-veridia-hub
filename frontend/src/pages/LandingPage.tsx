import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Shield, 
  DollarSign, 
  Users, 
  Zap, 
  Globe,
  CheckCircle,
  ArrowRight,
  Star,
  Play
} from 'lucide-react';

const features = [
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Sertifikat Digital Blockchain',
    description: 'Karya Anda dilindungi dengan teknologi blockchain yang tidak dapat dipalsukan dan tersimpan permanen.'
  },
  {
    icon: <DollarSign className="h-8 w-8" />,
    title: 'Monetisasi Otomatis',
    description: 'Dapatkan royalti secara otomatis setiap kali karya Anda digunakan dengan sistem pembayaran yang transparan.'
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: 'Marketplace Global',
    description: 'Jangkau pembeli dari seluruh dunia melalui marketplace terintegrasi dengan berbagai opsi lisensi.'
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: 'Proses Cepat & Mudah',
    description: 'Upload karya, pilih lisensi, dan mulai monetisasi hanya dalam beberapa langkah sederhana.'
  }
];

const testimonials = [
  {
    name: 'Sarah Wijaya',
    role: 'Digital Artist',
    content: 'VeridiaHub membantu saya melindungi karya seni digital dan mendapatkan penghasilan pasif yang konsisten.',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face',
    rating: 5
  },
  {
    name: 'Ahmad Rizki',
    role: 'Music Producer',
    content: 'Platform terbaik untuk musisi independen. Royalti otomatis dan perlindungan hak cipta yang kuat.',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?w=100&h=100&fit=crop&crop=face',
    rating: 5
  },
  {
    name: 'Maya Chen',
    role: 'Photographer',
    content: 'Sekarang foto-foto saya terlindungi dan saya bisa fokus berkarya tanpa khawatir pembajakan.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100&h=100&fit=crop&crop=face',
    rating: 5
  }
];

const stats = [
  { number: '2,500+', label: 'Karya Terdaftar' },
  { number: '1,200+', label: 'Kreator Aktif' },
  { number: '850,000 USDT', label: 'Total Penjualan' },
  { number: '99.9%', label: 'Uptime Platform' }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-red-600 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                VeridiaHub
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg transition-colors"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-blue-600 to-red-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-red-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Lindungi & Monetisasi
              <span className="block bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent">
                Karya Kreatif Digital
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Platform blockchain pertama di Indonesia untuk melindungi hak cipta dan 
              menghasilkan royalti dari karya kreatif digital Anda secara otomatis.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-red-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Mulai Gratis Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <button 
                onClick={() => {
                  console.log('Lihat Demo clicked');
                  alert('Lihat Demo clicked! Redirecting to marketplace...');
                  // Navigate to marketplace
                  window.location.href = '/marketplace';
                }}
                className="inline-flex items-center px-8 py-4 border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                <Play className="mr-2 h-5 w-5" />
                Lihat Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-red-600 bg-clip-text text-transparent mb-2 whitespace-nowrap">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih VeridiaHub?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Teknologi blockchain terdepan untuk melindungi dan memonetisasi karya kreatif Anda
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow border border-gray-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-red-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-blue-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cara Kerja Platform
            </h2>
            <p className="text-xl text-gray-600">
              Hanya 3 langkah mudah untuk mulai monetisasi karya Anda
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Karya</h3>
              <p className="text-gray-600">
                Unggah file karya kreatif Anda (gambar, audio, video, atau dokumen) 
                dengan informasi detail dan kategori yang sesuai.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mint NFT</h3>
              <p className="text-gray-600">
                Sistem akan membuat sertifikat digital blockchain yang melindungi 
                hak cipta dan membuktikan keaslian karya Anda.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Dapatkan Royalti</h3>
              <p className="text-gray-600">
                Pilih jenis lisensi dan mulai terima royalti otomatis setiap kali 
                karya Anda digunakan atau dibeli.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-red-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dipercaya Ribuan Kreator
            </h2>
            <p className="text-xl text-gray-600">
              Bergabunglah dengan komunitas kreator yang sudah merasakan manfaatnya
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Melindungi Karya Kreatif Anda?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ribuan kreator yang sudah mempercayai VeridiaHub 
            untuk melindungi dan memonetisasi karya digital mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 text-lg font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Daftar Gratis Sekarang
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              Sudah Punya Akun? Masuk
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-red-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">VeridiaHub</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Platform blockchain terdepan untuk melindungi dan memonetisasi 
                karya kreatif digital di Indonesia.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Users className="h-5 w-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <Globe className="h-5 w-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Cara Kerja</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Harga</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dokumentasi</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Pusat Bantuan</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontak</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 VeridiaHub Platform. Semua hak dilindungi.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Syarat & Ketentuan
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}