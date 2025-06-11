import { useState, useEffect } from 'react';
import { ChevronDown, Menu, X, Play, Users, Bot, Crown, Zap, Shield, Trophy, Star , EggFried } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const startGame = () => scrollToSection('modes');

  const Navbar = () => (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      scrollY > 50 ? 'bg-slate-900/95 backdrop-blur-lg border-b border-yellow-500/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Royal Chess
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('home')} className="text-white hover:text-yellow-400 transition-colors">
              Home
            </button>
            <button onClick={() => scrollToSection('features')} className="text-white hover:text-yellow-400 transition-colors">
              Features
            </button>
            <button onClick={() => scrollToSection('modes')} className="text-white hover:text-yellow-400 transition-colors">
              Game Modes
            </button>
            <button onClick={() => scrollToSection('about')} className="text-white hover:text-yellow-400 transition-colors">
              About
            </button>
            <button 
              onClick={startGame}
              className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-6 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25"
            >
              Play Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="md:hidden text-white hover:text-yellow-400 p-2">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ${
        isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      } bg-slate-900/95 backdrop-blur-lg border-b border-yellow-500/20`}>
        <div className="px-4 py-4 space-y-3">
          <button onClick={() => scrollToSection('home')} className="block w-full text-left text-white hover:text-yellow-400 py-2">
            Home
          </button>
          <button onClick={() => scrollToSection('features')} className="block w-full text-left text-white hover:text-yellow-400 py-2">
            Features
          </button>
          <button onClick={() => scrollToSection('modes')} className="block w-full text-left text-white hover:text-yellow-400 py-2">
            Game Modes
          </button>
          <button onClick={() => scrollToSection('about')} className="block w-full text-left text-white hover:text-yellow-400 py-2">
            About
          </button>
          <button 
            onClick={startGame}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black px-6 py-3 rounded-lg font-semibold mt-3"
          >
            Play Now
          </button>
        </div>
      </div>
    </nav>
  );

  const HeroSection = () => (
    <section id="home" className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden flex items-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-6xl text-yellow-400/10 animate-pulse">♜</div>
        <div className="absolute top-40 right-20 text-8xl text-yellow-400/5 animate-bounce">♞</div>
        <div className="absolute bottom-40 left-20 text-7xl text-yellow-400/10 animate-pulse" style={{animationDelay: '1s'}}>♝</div>
        <div className="absolute bottom-20 right-10 text-9xl text-yellow-400/5 animate-bounce" style={{animationDelay: '2s'}}>♛</div>
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent leading-tight">
            Royal Chess
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-4xl mx-auto leading-relaxed">
            Experience the ultimate chess adventure with stunning visuals, intelligent AI, and seamless multiplayer gameplay. 
            Master the game of kings like never before.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
          <button 
            onClick={startGame}
            className="group bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-8 py-4 rounded-xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105 hover:shadow-yellow-500/25 flex items-center space-x-2"
          >
            <Play className="h-6 w-6 group-hover:animate-pulse" />
            <span>Start Playing Now</span>
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="group bg-slate-800/50 backdrop-blur-sm border border-yellow-500/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-700/50 transition-all flex items-center space-x-2"
          >
            <Zap className="h-6 w-6 group-hover:text-yellow-400 transition-colors" />
            <span>Explore Features</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {[
            { icon: '∞', label: 'Infinite Games' },
            { icon: <Users className="h-8 w-8" />, label: 'Multiplayer' },
            { icon: <Bot className="h-8 w-8" />, label: 'Smart AI' },
            { icon: <Crown className="h-8 w-8" />, label: 'Be the King' }
          ].map((stat, index) => (
            <div key={index} className="bg-slate-800/30 backdrop-blur-sm border border-yellow-500/20 p-6 rounded-xl hover:bg-slate-700/30 transition-all transform hover:scale-105">
              <div className="text-3xl font-bold text-yellow-400 mb-2 flex justify-center">
                {typeof stat.icon === 'string' ? stat.icon : stat.icon}
              </div>
              <div className="text-slate-300 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <button 
        onClick={() => scrollToSection('features')}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-yellow-400 animate-bounce hover:text-yellow-300 transition-colors"
      >
        <ChevronDown className="h-8 w-8" />
      </button>
    </section>
  );

  const FeaturesSection = () => (
    <section id="features" className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-6">
            Powerful Features
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Discover what makes our chess game the ultimate choice for players of all skill levels
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Bot className="h-12 w-12" />,
              title: 'Advanced AI',
              description: 'Challenge yourself against Stockfish-powered AI with adjustable difficulty levels.'
            },
            {
              icon: <Users className="h-12 w-12" />,
              title: 'Play with Friends',
              description: 'Enjoy seamless multiplayer gameplay with friends locally or online.'
            },
            {
              icon: <Zap className="h-12 w-12" />,
              title: 'Lightning Fast',
              description: 'Optimized for performance with smooth animations and instant responses.'
            },
            {
              icon: <Shield className="h-12 w-12" />,
              title: 'Move Validation',
              description: 'Built-in chess rules engine ensures fair play and legal moves only.'
            },
            {
              icon: <Trophy className="h-12 w-12" />,
              title: 'Game Analysis',
              description: 'Review your games with move suggestions and position analysis.'
            },
            {
              icon: <Star className="h-12 w-12" />,
              title: 'Beautiful Interface',
              description: 'Stunning visuals with customizable themes and piece sets.'
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="group bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-xl hover:bg-slate-700/50 hover:border-yellow-500/40 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/10"
            >
              <div className="text-yellow-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const GameModesSection = () => (
    <section id="modes" className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-6">
            Game Modes
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Choose your preferred way to play and master the game
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-xl hover:bg-slate-700/50 transition-all" onClick={() => navigate('/online')}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Users className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Play with Friends</h3>
                  <p className="text-slate-300">Local multiplayer mode</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Challenge your friends to intense chess battles on the same device. Perfect for family game nights 
                and friendly competitions.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-xl hover:bg-slate-700/50 transition-all" onClick={() => navigate('/computer')}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Bot className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">AI Challenge</h3>
                  <p className="text-slate-300">Single player vs computer</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Test your skills against our advanced AI opponent. With multiple difficulty levels, 
                it's perfect for players of all skill levels.
              </p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-xl hover:bg-slate-700/50 transition-all" onClick={() => navigate('/pass')}>
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <EggFried  className="h-8 w-8 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Pass And Play</h3>
                  <p className="text-slate-300">Single player vs Single Player</p>
                </div>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Enjoy a classic pass-and-play experience where you can take turns with a friend on the same device. 
                Perfect for casual games and learning the ropes.
              </p>
            </div>
            
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 p-8 rounded-2xl border border-yellow-500/30">
              <div className="grid grid-cols-8 gap-1 mb-6">
                {Array.from({ length: 64 }, (_, i) => {
                  const row = Math.floor(i / 8);
                  const col = i % 8;
                  const isLight = (row + col) % 2 === 0;
                  return (
                    <div 
                      key={i} 
                      className={`aspect-square ${isLight ? 'bg-yellow-100' : 'bg-yellow-800'} rounded-sm`}
                    />
                  );
                })}
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold text-white mb-2">Interactive Chess Board</h4>
                <p className="text-slate-300">Beautiful, responsive design with smooth animations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const AboutSection = () => (
    <section id="about" className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-6">
            About Royal Chess
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-slate-300 leading-relaxed">
              Royal Chess is more than just a game – it's a complete chess experience designed for the modern player. 
              Built with cutting-edge technology and a passion for the timeless game of chess.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-500 p-2 rounded-lg mt-1">
                  <Crown className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Premium Experience</h4>
                  <p className="text-slate-300">Enjoy a polished interface with attention to every detail.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-500 p-2 rounded-lg mt-1">
                  <Zap className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Fast & Responsive</h4>
                  <p className="text-slate-300">Lightning-fast gameplay with no lag or delays.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-yellow-500 p-2 rounded-lg mt-1">
                  <Shield className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Fair Play Guaranteed</h4>
                  <p className="text-slate-300">Built-in validation ensures every game follows official chess rules.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 p-8 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Ready to Play?</h3>
            <div className="space-y-4">
              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <Play className="h-6 w-6" />
                <span>Start Your First Game</span>
              </button>
              
              <div className="text-center">
                <p className="text-slate-300 text-sm">
                  Join thousands of players already enjoying Royal Chess
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer className="bg-slate-900 border-t border-yellow-500/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Crown className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Royal Chess
            </span>
          </div>
          
          <div className="text-slate-300 text-center md:text-right">
            <p className="mb-2">Experience chess like never before</p>
            <p className="text-sm text-slate-400">© 2024 Royal Chess. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <GameModesSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default LandingPage;