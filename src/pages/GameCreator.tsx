
import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Sparkles, Code, Play, Loader2, AlertCircle, Zap } from 'lucide-react';
import { GeneratedGamePreview } from '@/components/GeneratedGamePreview';

const GameCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedGame, setGeneratedGame] = useState<{
    code: string;
    title: string;
    description: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateGame = async () => {
    if (!prompt.trim()) {
      setError('Please enter a game prompt');
      return;
    }
    
    if (!apiKey.trim()) {
      setError('Please enter your Gemini API key');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a complete, functional React game component based on this prompt: "${prompt}"

REQUIREMENTS:
- Create a fully playable game as a React functional component
- Use React hooks (useState, useEffect, useCallback)
- Include game state management (score, game status, etc.)
- Add keyboard/mouse controls as needed
- Style with Tailwind CSS classes using black background and neon green colors (Web3 theme)
- Make it responsive and visually appealing
- Include start/restart functionality
- The component should be named "GeneratedGame"
- Export as default export
- Make sure the code is complete and functional
- Use modern React patterns

Return ONLY the React component code, no explanations or markdown formatting.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const generatedCode = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedCode) {
        throw new Error('No code generated from API');
      }

      // Clean up the code (remove markdown formatting if present)
      const cleanCode = generatedCode
        .replace(/```jsx?\n?/g, '')
        .replace(/```\n?$/g, '')
        .trim();

      setGeneratedGame({
        code: cleanCode,
        title: `AI Game: ${prompt.slice(0, 30)}${prompt.length > 30 ? '...' : ''}`,
        description: `Generated from prompt: "${prompt}"`
      });
      
    } catch (err) {
      console.error('Error generating game:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate game');
    } finally {
      setIsGenerating(false);
    }
  };

  const examplePrompts = [
    "Create a space shooter where the player fights alien invaders",
    "Make a puzzle game about connecting colored dots",
    "Design a platformer where you collect gems and avoid spikes",
    "Build a tower defense game with magical towers",
    "Create a rhythm game where you hit notes to the beat"
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Web3 background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-400/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Matrix grid background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-20 grid-rows-20 h-full w-full">
            {[...Array(400)].map((_, i) => (
              <div key={i} className="border border-green-500/20"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <Header />
        
        <main className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section with Web3 theme */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400/20 rounded-xl blur-lg"></div>
                <div className="relative p-3 bg-gradient-to-br from-black to-gray-900 rounded-xl neon-border">
                  <Wand2 className="w-8 h-8 text-green-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-green-500 bg-clip-text text-transparent">
                AI Game Creator
              </h1>
            </div>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Describe your dream game and watch AI bring it to life. From simple concepts to complex mechanics, 
              create playable games with just your imagination and Web3 technology.
            </p>
          </div>

          {/* API Key Input with Web3 styling */}
          <Card className="mb-6 bg-gradient-to-br from-black to-gray-900 neon-border backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle className="w-5 h-5 text-green-400" />
                <Label htmlFor="apiKey" className="text-green-400 font-medium">
                  Gemini API Key Required
                </Label>
              </div>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your Gemini API key (get it from Google AI Studio)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-black/50 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
              />
              <p className="text-sm text-gray-400 mt-2">
                Get your free API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  Google AI Studio
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Input Section with Web3 styling */}
          <Card className="mb-8 bg-gradient-to-br from-black to-gray-900 neon-border backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Sparkles className="w-5 h-5" />
                <span>Describe Your Game</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
                  Game Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the game you want to create... Be specific about gameplay, mechanics, theme, and visual style."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-32 bg-black/50 border-green-500/30 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-green-400"
                />
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Example Prompts:</h4>
                <div className="grid gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="text-left p-3 bg-black/30 hover:bg-gray-900/50 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-200 text-gray-300 hover:text-green-300"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerateGame}
                disabled={!prompt.trim() || !apiKey.trim() || isGenerating}
                className="w-full web3-gradient hover:neon-glow text-black py-6 text-lg font-semibold border border-green-400/50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating Your Game...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generate Game
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output Section */}
          {(generatedGame || isGenerating) && (
            <Card className="bg-gradient-to-br from-black to-gray-900 neon-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-400">
                  <Play className="w-5 h-5" />
                  <span>Generated Game</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                      <Sparkles className="w-6 h-6 text-green-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Creating Your Game...</h3>
                    <p className="text-gray-400 text-center max-w-md">
                      Our AI is analyzing your prompt and generating a custom Web3 game experience. This may take a few moments.
                    </p>
                  </div>
                ) : generatedGame && (
                  <GeneratedGamePreview game={generatedGame} />
                )}
              </CardContent>
            </Card>
          )}

          {/* Features Section with Web3 theme */}
          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <Card className="bg-gradient-to-br from-black to-gray-900 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-black to-gray-900 rounded-xl flex items-center justify-center neon-border">
                  <Wand2 className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Generation</h3>
                <p className="text-gray-400">Advanced AI understands your prompts and creates fully functional Web3 games</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-black to-gray-900 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-black to-gray-900 rounded-xl flex items-center justify-center neon-border">
                  <Play className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Instantly Playable</h3>
                <p className="text-gray-400">Generated games are immediately playable with no additional setup required</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-black to-gray-900 border-green-500/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-black to-gray-900 rounded-xl flex items-center justify-center neon-border">
                  <Code className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Source Code Included</h3>
                <p className="text-gray-400">View and modify the generated code to customize your Web3 game further</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GameCreator;
