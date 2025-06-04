
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HelpCircle } from 'lucide-react';

interface GameGuideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle: string;
}

export const GameGuideDialog = ({ isOpen, onClose, gameId, gameTitle }: GameGuideDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-green-400/30 text-white max-w-2xl backdrop-blur-xl shadow-2xl shadow-green-400/20">
        <DialogHeader>
          <DialogTitle className="text-center text-green-400 flex items-center justify-center gap-3 text-2xl font-bold">
            <HelpCircle className="w-6 h-6" />
            How to Play: {gameTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Features */}
          <div>
            <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
              🤖 AI-Powered Gaming
            </h3>
            <div className="p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 rounded-xl border border-purple-400/30 backdrop-blur-sm">
              <div className="space-y-4">
                <p className="text-gray-200 leading-relaxed">
                  Experience next-generation gaming with our advanced AI opponent that adapts to your playstyle in real-time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-400/20">
                    <div className="text-cyan-400 font-semibold mb-2">🧠 Smart Adaptation</div>
                    <div className="text-sm text-gray-300">AI learns from your moves and adjusts its strategy dynamically</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-400/20">
                    <div className="text-green-400 font-semibold mb-2">⚡ Real-time Response</div>
                    <div className="text-sm text-gray-300">Lightning-fast AI reactions for seamless gameplay</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-400/20">
                    <div className="text-yellow-400 font-semibold mb-2">🎯 Balanced Challenge</div>
                    <div className="text-sm text-gray-300">Difficulty scales with your skill level for optimal fun</div>
                  </div>
                  <div className="bg-black/30 p-4 rounded-lg border border-purple-400/20">
                    <div className="text-pink-400 font-semibold mb-2">🚀 Unique Experience</div>
                    <div className="text-sm text-gray-300">Every game session offers a completely new challenge</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Instructions Placeholder */}
          <div className="text-center py-8 bg-gradient-to-r from-gray-900/30 to-black/30 rounded-xl border border-gray-600/30">
            <div className="text-gray-400 mb-4">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold">Game Instructions</p>
              <p className="text-sm mt-2">Detailed gameplay instructions will be available soon.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
