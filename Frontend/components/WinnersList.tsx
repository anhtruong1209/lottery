import React, { useState } from 'react';
import { Winner, Participant } from '../types';
import { Trophy, Gift, X, Users } from 'lucide-react';

interface WinnersListProps {
  winners: Winner[];
  participants: Participant[];
  isVisible: boolean;
  onClose: () => void;
}

const WinnersList: React.FC<WinnersListProps> = ({ winners, participants, isVisible, onClose }) => {
  const [activeTab, setActiveTab] = useState<'winners' | 'participants'>('winners');

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-2xl overflow-hidden border-yellow-500/50 shadow-2xl flex flex-col">

        {/* Header with Tabs */}
        <div className="bg-gradient-to-r from-yellow-600/80 to-yellow-800/80 p-0 border-b border-yellow-400/30 flex justify-between items-center pr-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('winners')}
              className={`flex items-center gap-3 px-8 py-6 text-lg font-bold transition-all ${activeTab === 'winners'
                  ? 'bg-yellow-500/20 text-white border-r border-yellow-400/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              <Trophy size={24} className={activeTab === 'winners' ? "text-yellow-300" : ""} />
              DS TRÚNG THƯỞNG ({winners.length})
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex items-center gap-3 px-8 py-6 text-lg font-bold transition-all ${activeTab === 'participants'
                  ? 'bg-yellow-500/20 text-white border-l border-r border-yellow-400/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
            >
              <Users size={24} className={activeTab === 'participants' ? "text-blue-300" : ""} />
              DS THAM DỰ ({participants.length})
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-black/40 to-black/60">
          {activeTab === 'winners' ? (
            // --- WINNERS LIST ---
            winners.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <Gift size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Chưa có người nào nhận quà</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {winners.map((winner, idx) => (
                  <div
                    key={`${winner.id}-${idx}`}
                    className="glass-panel p-3 rounded-lg border-yellow-400/30 hover:border-yellow-400/60 transition-all hover:scale-105 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10"
                  >
                    <div className="flex flex-col">
                      {/* Name & Department */}
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border border-yellow-300/50">
                          <span className="text-xs font-bold text-white">
                            {winner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate leading-tight">{winner.name}</h3>
                          <div className="text-[10px] text-yellow-200 truncate opacity-80 mt-0.5">
                            {winner.department}
                          </div>
                        </div>
                      </div>

                      {/* Prize Label */}
                      {winner.prizeLabel && (
                        <div className="mt-1.5 px-2 py-1 bg-yellow-600/20 rounded border border-yellow-400/20 text-center">
                          <p className="text-yellow-300 text-[10px] font-bold truncate">
                            {winner.prizeLabel}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // --- PARTICIPANTS LIST ---
            participants.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <Users size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg">Chưa có người tham gia</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {participants.map((person) => {
                  const isWinner = winners.some(w => w.id === person.id);
                  return (
                    <div
                      key={person.id}
                      className={`glass-panel p-3 rounded-lg transition-all hover:scale-105 ${isWinner
                          ? 'border-yellow-400/30 bg-yellow-900/10'
                          : 'border-white/10 bg-white/5'
                        }`}
                    >
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg border ${isWinner
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300/50'
                              : 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300/50'
                            }`}>
                            <span className="text-xs font-bold text-white">
                              {person.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-white truncate leading-tight">{person.name}</h3>
                            <div className="text-[10px] text-gray-300 truncate opacity-80 mt-0.5">
                              {person.department}
                            </div>
                          </div>
                        </div>
                        {isWinner && (
                          <div className="mt-1 text-[10px] text-yellow-500 font-bold text-center border border-yellow-500/30 rounded px-1 bg-yellow-500/10">
                            Đã trúng giải
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex justify-end items-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold rounded-lg transition-all shadow-lg hover:scale-105 flex items-center gap-2"
          >
            <X size={18} />
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnersList;
