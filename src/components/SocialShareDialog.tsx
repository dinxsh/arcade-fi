
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Share2, Twitter, Facebook, Copy, Download } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  game: string;
  score: number;
}

export const SocialShareDialog = ({ isOpen, onClose, game, score }: SocialShareDialogProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const shareText = `🎮 Just scored ${score} points in ${game} on AI Arcade! Can you beat my score? 🚀 #AIArcade #Gaming #AI`;
  const shareUrl = window.location.origin;

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      toast.success('Score copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const generateScoreImage = async () => {
    setIsGeneratingImage(true);
    
    // Create a canvas to generate score image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 400;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#000000');
    gradient.addColorStop(0.5, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add neon border
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Add text
    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('AI ARCADE', canvas.width / 2, 80);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Game: ${game}`, canvas.width / 2, 160);

    ctx.fillStyle = '#00ff88';
    ctx.font = 'bold 64px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, 240);

    ctx.fillStyle = '#aaaaaa';
    ctx.font = '24px Arial';
    ctx.fillText('Can you beat my score?', canvas.width / 2, 320);
    ctx.fillText('Play at arcade-fi.vercel.app', canvas.width / 2, 350);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-arcade-score-${game}-${score}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Score image downloaded!');
      }
      setIsGeneratingImage(false);
    }, 'image/png');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/95 border-green-500/30 text-white max-w-md backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-green-400 flex items-center justify-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Your Score
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Score Display */}
          <div className="text-center p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
            <div className="text-3xl font-bold text-green-400 mb-2">{score}</div>
            <div className="text-gray-300">points in {game}</div>
          </div>

          {/* Share Preview */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/20">
            <p className="text-sm text-gray-300 leading-relaxed">{shareText}</p>
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleTwitterShare}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-all duration-200"
            >
              <Twitter className="w-4 h-4" />
              Twitter
            </button>
            
            <button
              onClick={handleFacebookShare}
              className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg transition-all duration-200"
            >
              <Facebook className="w-4 h-4" />
              Facebook
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg transition-all duration-200"
            >
              <Copy className="w-4 h-4" />
              Copy Text
            </button>
            
            <button
              onClick={generateScoreImage}
              disabled={isGeneratingImage}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isGeneratingImage ? 'Creating...' : 'Download Image'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
