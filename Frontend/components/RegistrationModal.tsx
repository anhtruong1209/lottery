import React, { useState } from 'react';
import { Participant } from '../types';
import { QrCode, X, Plus } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (name: string, dept: string) => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, onAddParticipant }) => {
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && dept) {
      await onAddParticipant(name, dept);
      setName('');
      setDept('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-4xl h-[80vh] rounded-2xl flex overflow-hidden animate-pulse-glow border-vishipel-accent/30">

        {/* Left Side: QR Code Display */}
        <div className="w-1/2 bg-white/5 flex flex-col items-center justify-center p-8 border-r border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-vishipel-accent">Quét mã để check-in</h2>
          <div className="bg-white p-4 rounded-xl shadow-lg">
            {/* Dynamic QR Code - points to /lookup page */}
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/lookup')}`}
              alt="QR Code Register"
              className="w-64 h-64 object-contain"
            />
          </div>
          <p className="mt-6 text-gray-300 text-center text-sm">
            Sử dụng điện thoại để quét mã QR và nhập thông tin cá nhân để tham gia quay thưởng.
          </p>
        </div>

        {/* Right Side: Manual Input & List simulation */}
        <div className="w-1/2 p-8 flex flex-col relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Plus size={20} className="text-green-400" />
            Thêm người tham dự
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Họ và tên</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-vishipel-accent transition-colors"
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Phòng ban / Đơn vị</label>
              <input
                type="text"
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-vishipel-accent transition-colors"
                placeholder="Phòng Kỹ Thuật"
              />
            </div>
            <button
              type="submit"
              disabled={!name || !dept}
              className="w-full bg-vishipel-main hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition-all shadow-lg shadow-blue-900/50"
            >
              Thêm vào danh sách
            </button>
          </form>

          <div className="flex-1 overflow-y-auto">
            <h4 className="text-sm uppercase tracking-wider text-gray-400 mb-3 border-b border-white/10 pb-2">Hướng dẫn</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex gap-2">
                <span className="text-vishipel-accent">•</span>
                <span>Hệ thống tự động lọc trùng người tham gia.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-vishipel-accent">•</span>
                <span>Chế độ "Check-in" sẽ tự động cập nhật tên lên quả địa cầu.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;
