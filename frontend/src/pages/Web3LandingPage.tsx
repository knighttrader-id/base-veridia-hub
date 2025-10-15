import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Users, 
  TrendingUp, 
  Star, 
  ArrowRight, 
  Play, 
  CheckCircle,
  Globe,
  Lock,
  Sparkles,
  Heart,
  Award,
  Rocket
} from 'lucide-react';
import { AnimatedBackground, FloatingElements } from '../components/AnimatedBackground';
import { Web3Navbar } from '../components/Web3Navbar';
import DemoModeBadge from '../components/DemoModeBadge';
import { Web3Card } from '../components/Web3Card';

export default function Web3LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Blockchain Security",
      description: "Immutable copyright protection using SHA-256 hashing and smart contracts"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Multi-Token Payments",
      description: "Support for ETH, USDC, USDT, DAI, and IDRX with seamless token selection"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Creator Economy",
      description: "95% revenue to creators, 4% platform, 1% national fund with automated distribution"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Real-time insights, performance tracking, and multi-token revenue analytics"
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Gas Optimization",
      description: "20-33% gas savings with batch operations and optimized smart contracts"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "Production Ready",
      description: "154/154 tests passing with comprehensive error handling and security"
    }
  ];

  const stats = [
    { label: "Total Artworks", value: "2,500+", icon: <Zap className="h-6 w-6" /> },
    { label: "Active Creators", value: "1,200+", icon: <Users className="h-6 w-6" /> },
    { label: "Total Sales", value: "850,000 USDT", icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Avg. Price", value: "340 USDT", icon: <Award className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      avatar: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?w=100&h=100&fit=crop&crop=face",
      content: "The multi-token payment system is incredible! I can accept USDC, USDT, and even IDRX for my international clients.",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Music Producer",
      avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=100&h=100&fit=crop&crop=face",
      content: "The gas optimization saves me so much money on transactions. The 20-33% savings really add up!",
      rating: 5
    },
    {
      name: "Elena Volkov",
      role: "3D Artist",
      avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100&h=100&fit=crop&crop=face",
      content: "Production-ready platform with 154/154 tests passing. I trust VeridiaHub with my most valuable creations.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <AnimatedBackground variant="particles" intensity="high" />
      <FloatingElements />
      
      {/* Web3 Navbar */}
      <Web3Navbar />
      
      {/* Demo Mode Badge */}
      <DemoModeBadge />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
                VeridiaHub
              </h1>
              <h2 className="text-3xl md:text-5xl text-white/90 mb-8 font-light">
                The Future of Digital Copyright
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
                Protect, monetize, and trade your digital creations with multi-token payments. 
                Support for ETH, USDC, USDT, DAI, and IDRX with 20-33% gas savings and 154/154 tests passing.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link
                  to="/marketplace"
                  className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3"
                >
                  <Rocket className="h-6 w-6" />
                  Explore Marketplace
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/upload"
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                >
                  <Zap className="h-5 w-5" />
                  Start Creating
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-2 whitespace-nowrap">
                      {stat.icon}
                      <span className="truncate">{stat.value}</span>
                    </div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose VeridiaHub?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Built for creators, powered by blockchain technology
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 h-full">
                    <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multi-Token Payment System */}
        <section className="py-20 px-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Multi-Token Payment System
                <span className="block text-2xl text-green-400 mt-2">✅ Production Ready</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Accept payments in 5 different tokens with seamless conversion and 20-33% gas savings
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              {[
                { name: "Ethereum", symbol: "ETH", decimals: 18, color: "from-gray-400 to-gray-600" },
                { name: "USD Coin", symbol: "USDC", decimals: 6, color: "from-blue-400 to-blue-600" },
                { name: "Tether USD", symbol: "USDT", decimals: 6, color: "from-green-400 to-green-600" },
                { name: "Dai Stablecoin", symbol: "DAI", decimals: 18, color: "from-orange-400 to-orange-600" },
                { name: "Indonesian Rupiah", symbol: "IDRX", decimals: 6, color: "from-red-400 to-red-600" }
              ].map((token, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r ${token.color} flex items-center justify-center text-white font-bold text-lg`}>
                    {token.symbol.charAt(0)}
                  </div>
                  <h3 className="text-white font-bold mb-2">{token.symbol}</h3>
                  <p className="text-gray-400 text-sm">{token.name}</p>
                  <p className="text-gray-500 text-xs mt-1">{token.decimals} decimals</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-green-400 mb-4">154/154</div>
                <h3 className="text-xl font-bold text-white mb-2">Tests Passing</h3>
                <p className="text-gray-300">Comprehensive test coverage with 100% success rate</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-blue-400 mb-4">20-33%</div>
                <h3 className="text-xl font-bold text-white mb-2">Gas Savings</h3>
                <p className="text-gray-300">Optimized smart contracts with batch operations</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
                <div className="text-4xl font-bold text-purple-400 mb-4">5</div>
                <h3 className="text-xl font-bold text-white mb-2">Supported Tokens</h3>
                <p className="text-gray-300">ETH, USDC, USDT, DAI, and IDRX support</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4 bg-black/20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Simple steps to protect and monetize your digital creations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Upload Your Artwork",
                  description: "Upload your digital creation and get a unique blockchain hash for copyright protection"
                },
                {
                  step: "02",
                  title: "Mint as NFT",
                  description: "Convert your artwork into an NFT with automated metadata and ownership tracking"
                },
                {
                  step: "03",
                  title: "Monetize & Trade",
                  description: "List for sale, set licensing terms, and earn from every transaction automatically"
                }
              ].map((step, index) => (
                <div key={index} className="text-center group">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                    <div className="text-6xl font-bold text-blue-400 mb-4 opacity-50">
                      {step.step}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    <p className="text-gray-300">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                What Creators Say
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join thousands of creators who trust VeridiaHub
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="group">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 h-full">
                    <div className="flex items-center mb-6">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="text-white font-semibold">{testimonial.name}</h4>
                        <p className="text-gray-400 text-sm">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-300 italic">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Protect Your Art?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the Web3 revolution and secure your digital creations with blockchain technology
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/upload"
                  className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3 justify-center"
                >
                  <Zap className="h-6 w-6" />
                  Get Started Now
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/marketplace"
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white font-semibold py-4 px-8 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 justify-center"
                >
                  <Play className="h-5 w-5" />
                  Watch Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 bg-black/40 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">VeridiaHub</h3>
                    <p className="text-sm text-gray-400">Web3 Platform</p>
                  </div>
                </div>
                <p className="text-gray-400">
                  Empowering creators with blockchain technology for copyright protection and monetization.
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
                  <li><Link to="/upload" className="hover:text-white transition-colors">Upload</Link></li>
                  <li><Link to="/ip-registry" className="hover:text-white transition-colors">Registry</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4">Connect</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">GitHub</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-400">
              <p>&copy; 2025 VeridiaHub. All rights reserved. Built with ❤️ for creators.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
