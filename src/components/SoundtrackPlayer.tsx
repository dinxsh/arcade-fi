
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';

const soundtracks = [
  { id: 1, name: 'Neon Dreams', url: '/sounds/neon-dreams.mp3' },
  { id: 2, name: 'Cyber Pulse', url: '/sounds/cyber-pulse.mp3' },
  { id: 3, name: 'Digital Aurora', url: '/sounds/digital-aurora.mp3' },
  { id: 4, name: 'Techno Flow', url: '/sounds/techno-flow.mp3' }
];

export const SoundtrackPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : volume;
    
    const handleEnded = () => {
      setCurrentTrack((prev) => (prev + 1) % soundtracks.length);
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [volume, isMuted, currentTrack]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      // For demo purposes, we'll use a beep sound as placeholder
      audio.play().catch(() => {
        console.log('Audio playback failed - using placeholder sounds');
      });
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % soundtracks.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + soundtracks.length) % soundtracks.length);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-xl border border-green-500/30 rounded-xl p-4 min-w-80 z-50">
      <audio ref={audioRef} src={soundtracks[currentTrack].url} />
      
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-green-400 font-semibold text-sm">Now Playing</div>
          <div className="text-white text-xs">{soundtracks[currentTrack].name}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1 text-gray-400 hover:text-green-400 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={prevTrack}
          className="p-2 text-gray-400 hover:text-green-400 transition-colors"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        
        <button
          onClick={togglePlay}
          className="p-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 rounded-full text-white transition-all duration-200"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        
        <button
          onClick={nextTrack}
          className="p-2 text-gray-400 hover:text-green-400 transition-colors"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3">
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
      </div>
    </div>
  );
};
