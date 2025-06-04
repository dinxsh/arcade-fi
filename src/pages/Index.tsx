
import { GameGrid } from '@/components/GameGrid';
import { Header } from '@/components/Header';
import { Gamepad2, Zap, Brain, Trophy, Sparkles, Star, Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced animated background effects with Web3 theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-300/6 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-green-500/6 rounded-full blur-2xl animate-float"></div>
        
        {/* Matrix-style background grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {[...Array(400)].map((_, i) => (
              <div key={i} className="border border-green-500/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating particles effect with neon green */}
      <div className="particles fixed inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="particle absolute w-2 h-2 bg-green-400/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 2}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        <Header />
        
        {/* Enhanced Hero Section with Web3 aesthetics */}
        <section className="text-center py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-2xl md:text-3xl text-gray-100 mb-8 animate-fade-in delay-200 leading-relaxed">
              <span className="text-green-400 font-semibold">Relive Classics, Compete, Earn Rewards & Create Games with AI</span>
            </p>

            {/* Enhanced feature badges with Web3 theme */}
            <div className="flex flex-wrap justify-center gap-6 mb-16">
              <div className="group flex items-center gap-3 bg-gradient-to-r from-black to-gray-900 px-6 py-3 rounded-full neon-border hover:neon-glow transition-all duration-300 hover-lift">
                <Brain className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <span className="text-green-300 font-semibold text-lg">AI-Powered</span>
                <Sparkles className="w-4 h-4 text-green-400 opacity-70" />
              </div>
              <div className="group flex items-center gap-3 bg-gradient-to-r from-black to-gray-900 px-6 py-3 rounded-full neon-border hover:neon-glow transition-all duration-300 hover-lift">
                <Zap className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <span className="text-green-300 font-semibold text-lg">Instant Play</span>
                <Star className="w-4 h-4 text-green-400 opacity-70" />
              </div>
              <div className="group flex items-center gap-3 bg-gradient-to-r from-black to-gray-900 px-6 py-3 rounded-full neon-border hover:neon-glow transition-all duration-300 hover-lift">
                <Shield className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
                <span className="text-green-300 font-semibold text-lg">Web3 Ready</span>
                <Trophy className="w-4 h-4 text-green-400 opacity-70" />
              </div>
            </div>

            {/* Call to action with neon styling */}
            <div className="animate-fade-in delay-200">
              <button className="group web3-gradient hover:neon-glow text-black px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-green-400/50">
                <span className="flex items-center gap-3">
                  <a href="create">Start Gaming</a>
                  <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform duration-200" />
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Enhanced Games Grid Section */}
        <section className="px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                Choose Your Challenge
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Dive into our collection of AI-enhanced retro games. Each game features intelligent opponents, 
                adaptive difficulty, and cutting-edge Web3 integration.
              </p>
            </div>
            <GameGrid />
          </div>
        </section>

        {/* Enhanced footer section with Web3 theme */}
        <footer className="text-center py-12 px-4 border-t border-green-500/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-gradient-to-br from-black to-gray-900 rounded-full neon-border">
                <Zap className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <p className="text-gray-300 text-lg">
              Powered by cutting-edge AI technology for the ultimate Web3 gaming experience
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
