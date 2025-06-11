import { Crown, RotateCcw, Undo, Bot, Users, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const ComingSoon = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 text-6xl text-yellow-400/10 animate-pulse">♜</div>
        <div className="absolute top-40 right-20 text-8xl text-yellow-400/5 animate-bounce">♞</div>
        <div className="absolute bottom-40 left-20 text-7xl text-yellow-400/10 animate-pulse" style={{animationDelay: '1s'}}>♝</div>
        <div className="absolute bottom-20 right-10 text-9xl text-yellow-400/5 animate-bounce" style={{animationDelay: '2s'}}>♛</div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center min-h-screen py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="h-10 w-10 text-yellow-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
              Royal Chess
            </h1>
          </div>
          <p className="text-slate-300 text-lg">Master the Game of Kings</p>
        </div>

        <div className="bg-slate-800/70 backdrop-blur-sm border border-yellow-500/30 px-6 py-3 rounded-xl mb-8 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <span className="text-yellow-400 font-semibold text-lg">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon
