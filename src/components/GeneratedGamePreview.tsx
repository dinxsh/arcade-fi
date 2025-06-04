
import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Code, Copy, ExternalLink, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedGamePreviewProps {
  game: {
    code: string;
    title: string;
    description: string;
  };
}

export const GeneratedGamePreview = ({ game }: GeneratedGamePreviewProps) => {
  const [showCode, setShowCode] = useState(false);
  const [iframeError, setIframeError] = useState<string | null>(null);

  // Create a blob URL for the iframe to render the React component
  const gameUrl = useMemo(() => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Game</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { 
            margin: 0; 
            padding: 16px; 
            background: #000000; 
            min-height: 100vh; 
            font-family: system-ui, -apple-system, sans-serif;
        }
        #root { 
            height: 100%; 
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: calc(100vh - 32px);
        }
        .error-display {
            background: #dc2626;
            color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            margin: 20px;
        }
        .error-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .error-message {
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect, useCallback, useRef } = React;
        
        // Error boundary component
        class ErrorBoundary extends React.Component {
            constructor(props) {
                super(props);
                this.state = { hasError: false, error: null };
            }
            
            static getDerivedStateFromError(error) {
                return { hasError: true, error: error.toString() };
            }
            
            componentDidCatch(error, errorInfo) {
                console.error('Game Error:', error, errorInfo);
            }
            
            render() {
                if (this.state.hasError) {
                    return (
                        <div className="error-display">
                            <div className="error-title">Game Error</div>
                            <div className="error-message">{this.state.error}</div>
                        </div>
                    );
                }
                return this.props.children;
            }
        }
        
        try {
            // Generated game code
            ${game.code}
            
            const App = () => {
                return (
                    <ErrorBoundary>
                        <div className="w-full h-full flex items-center justify-center">
                            <GeneratedGame />
                        </div>
                    </ErrorBoundary>
                );
            };
            
            ReactDOM.render(<App />, document.getElementById('root'));
            
        } catch (error) {
            console.error('Compilation Error:', error);
            document.getElementById('root').innerHTML = \`
                <div class="error-display">
                    <div class="error-title">Compilation Error</div>
                    <div class="error-message">\${error.toString()}</div>
                </div>
            \`;
        }
        
        // Listen for errors and send them to parent
        window.addEventListener('error', function(e) {
            console.error('Runtime Error:', e.error);
            window.parent.postMessage({
                type: 'error',
                message: e.error ? e.error.toString() : e.message
            }, '*');
        });
        
        window.addEventListener('unhandledrejection', function(e) {
            console.error('Unhandled Promise Rejection:', e.reason);
            window.parent.postMessage({
                type: 'error',
                message: e.reason ? e.reason.toString() : 'Unhandled promise rejection'
            }, '*');
        });
    </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [game.code]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(game.code);
      toast.success('Code copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  const handleOpenInNewTab = () => {
    window.open(gameUrl, '_blank');
  };

  // Listen for error messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'error') {
        setIframeError(event.data.message);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{game.title}</h3>
            <p className="text-gray-400 text-sm">{game.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleOpenInNewTab}
              variant="outline"
              size="sm"
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in New Tab
            </Button>
          </div>
        </div>
        
        {/* Error Display */}
        {iframeError && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">Game Runtime Error</span>
            </div>
            <p className="text-red-300 text-sm font-mono">{iframeError}</p>
          </div>
        )}
        
        {/* Game Preview */}
        <div className="mb-6">
          <div className="w-full h-96 border border-blue-500/30 rounded-lg overflow-hidden bg-black">
            <iframe
              src={gameUrl}
              className="w-full h-full"
              title="Generated Game Preview"
              sandbox="allow-scripts allow-same-origin"
              onLoad={() => setIframeError(null)}
            />
          </div>
        </div>

        {/* Code Section */}
        <div className="bg-black/50 rounded-lg border border-gray-800">
          <div className="flex items-center justify-between p-3 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <Code className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Generated Code</span>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowCode(!showCode)}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                {showCode ? 'Hide Code' : 'Show Code'}
              </Button>
              <Button
                onClick={handleCopyCode}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>
          {showCode && (
            <div className="p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                <code>{game.code}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
