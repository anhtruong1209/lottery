import React from 'react';
import { Winner } from '../types';
import { X, Trophy } from 'lucide-react';

interface WinnerDisplayProps {
  winners: Winner[];
  isVisible: boolean;
  onClose: () => void;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winners, isVisible, onClose }) => {
  if (!isVisible || winners.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-7xl max-h-[90vh] rounded-2xl flex flex-col overflow-hidden border-yellow-400/30 shadow-2xl">

        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-yellow-600/30 to-yellow-800/30 border-b border-yellow-400/20 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white uppercase tracking-wider">CHÚC MỪNG</h2>
              <p className="text-yellow-200 text-sm mt-1">Danh sách người may mắn trúng thưởng</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* Winners Grid */}
        <div className="p-6 bg-gradient-to-b from-black/40 to-black/60 overflow-y-auto">
          <div className={winners.length < 5
            ? "flex flex-wrap gap-3 justify-center"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-items-center"
          }>
            {winners.map((winner, idx) => (
              <div
                key={winner.id}
                className="glass-panel p-3 rounded-xl border-yellow-400/30 hover:border-yellow-400/60 transition-all hover:scale-105 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 w-full max-w-[200px]"
              >
                <div className="flex flex-col items-center text-center">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 shadow-lg border-2 border-yellow-300/50">
                    <span className="text-base font-bold text-white">
                      {winner.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-bold text-white mb-1">{winner.name}</h3>

                  {/* Department */}
                  <span className="inline-block px-2 py-0.5 bg-yellow-600/30 text-yellow-200 text-[10px] font-semibold rounded-full border border-yellow-400/30 mb-2">
                    {winner.department}
                  </span>

                  {/* Prize Label Only */}
                  {winner.prizeLabel && (
                    <div className="mt-1 px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-lg border border-yellow-400/40 w-full">
                      <p className="text-yellow-300 text-xs font-bold truncate">{winner.prizeLabel}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <X size={20} />
              Đóng lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerDisplay;
