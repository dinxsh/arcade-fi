
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Web3 background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="text-center relative z-10 max-w-md mx-auto px-6">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg"></div>
            <div className="relative p-4 bg-gradient-to-br from-black to-gray-900 rounded-full neon-border">
              <AlertTriangle className="w-16 h-16 text-green-400" />
            </div>
          </div>
        </div>
        
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist in this dimension.
        </p>
        
        <a 
          href="/" 
          className="inline-flex items-center gap-3 web3-gradient hover:neon-glow text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-green-400/50"
        >
          <Home className="w-5 h-5" />
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
