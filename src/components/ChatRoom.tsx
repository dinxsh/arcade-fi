
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Users, MessageCircle } from 'lucide-react';

interface ChatRoomProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatRoom = ({ isOpen, onClose }: ChatRoomProps) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-cyan-400/30 text-white max-w-2xl max-h-[80vh] backdrop-blur-xl shadow-2xl shadow-cyan-400/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
            <MessageCircle className="w-6 h-6 text-cyan-400" />
            Global Chat Room
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Online Users */}
          <div className="flex items-center gap-2 text-sm text-gray-300 bg-gradient-to-r from-gray-900/50 to-black/50 p-3 rounded-lg border border-cyan-400/20">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-green-400 font-semibold">247 players online</span>
          </div>

          {/* Chat Messages Area */}
          <div className="h-80 bg-gradient-to-br from-gray-900/50 to-black/50 rounded-xl p-4 border border-cyan-400/20 overflow-y-auto">
            <div className="text-center text-gray-400 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-cyan-400/50" />
              <p className="text-lg font-semibold">Welcome to AI Arcade Chat!</p>
              <p className="text-sm mt-2">Connect with players worldwide and share your gaming experiences.</p>
            </div>
          </div>

          {/* Message Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-gradient-to-r from-gray-900/80 to-black/80 border border-cyan-400/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
              maxLength={200}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
