import React, { useState } from 'react';
import { Participant, DrawConfig, Winner } from '../types';
import { apiService } from '../utils/apiService';
import { X, Trash2, Edit2, Plus, Save, RotateCcw, DatabaseBackup } from 'lucide-react';
import { DEPARTMENTS } from '../utils/departments';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  drawConfigs: DrawConfig[];
  setDrawConfigs: React.Dispatch<React.SetStateAction<DrawConfig[]>>;
  winners: Winner[];
  onResetWinners: () => void;
  onRestoreDefaults: () => void;
  onDeleteAllParticipants: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, participants, setParticipants, drawConfigs, setDrawConfigs, winners, onResetWinners, onRestoreDefaults, onDeleteAllParticipants
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'config'>('participants');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState(''); // New Filter State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');

  // Add participant state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState(DEPARTMENTS[0]); // Default to first dept

  if (!isOpen) return null;

  // --- Participant Logic ---
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? p.department === filterDept : true;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id: string) => {
    // Improve UX: Standard confirm
    if (window.confirm('Bạn có chắc chắn muốn xóa người này khỏi danh sách?')) {
      try {
        await apiService.deleteParticipant(id);
        setParticipants(prev => prev.filter(p => p.id !== id));
      } catch (error: any) {
        alert(error.message || 'Có lỗi xảy ra khi xóa người tham gia');
      }
    }
  };

  const startEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditDept(p.department);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await apiService.updateParticipant(editingId, editName, editDept);
      setParticipants(prev => prev.map(p =>
        p.id === editingId ? { ...p, name: editName, department: editDept } : p
      ));
      setEditingId(null);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật người tham gia');
    }
  };

  const handleAddParticipant = async () => {
    if (!newName.trim() || !newDept.trim()) {
      alert('Vui lòng nhập đầy đủ tên và phòng ban');
      return;
    }
    try {
      const newParticipant = await apiService.createParticipant(newName.trim(), newDept.trim());
      // Add to beginning of list (unshift) instead of end
      setParticipants(prev => [newParticipant, ...prev]);
      setNewName('');
      setNewDept(DEPARTMENTS[0]);
      setShowAddForm(false);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi thêm người tham gia');
    }
  };

  // --- Config Logic ---
  const handleConfigChange = async (id: string, field: keyof DrawConfig, value: string | number) => {
    const config = drawConfigs.find(c => c.id === id);
    if (!config) return;

    const newLabel = field === 'label' ? value as string : config.label;
    const newCount = field === 'count' ? value as number : config.count;

    try {
      await apiService.updateDrawConfig(id, newLabel, newCount);
      setDrawConfigs(prev => prev.map(c =>
        c.id === id ? { ...c, [field]: value } : c
      ));
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật cấu hình');
    }
  };

  const addConfig = async () => {
    try {
      const newConfig = await apiService.createDrawConfig('Giải Mới', 1);
      setDrawConfigs(prev => [...prev, newConfig]);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi tạo cấu hình mới');
    }
  };

  const removeConfig = async (id: string) => {
    try {
      await apiService.deleteDrawConfig(id);
      setDrawConfigs(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi xóa cấu hình');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden border-white/20 shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-vishipel-main px-3 py-1 rounded text-sm">ADMIN</span>
            Quản trị hệ thống
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('participants')}
            className={`px-8 py-4 font-semibold text-sm transition-colors ${activeTab === 'participants' ? 'bg-vishipel-main/20 text-vishipel-accent border-b-2 border-vishipel-accent' : 'text-gray-400 hover:text-white'}`}
          >
            Danh sách người tham gia ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`px-8 py-4 font-semibold text-sm transition-colors ${activeTab === 'config' ? 'bg-vishipel-main/20 text-vishipel-accent border-b-2 border-vishipel-accent' : 'text-gray-400 hover:text-white'}`}
          >
            Cấu hình giải thưởng
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-6 bg-[#090A0F]/80">

          {/* PARTICIPANTS TAB */}
          {activeTab === 'participants' && (
            <div className="h-full flex flex-col">
              <div className="mb-4 flex gap-4 flex-wrap items-start">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-vishipel-accent outline-none min-w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* DEPARTMENT FILTER */}
                <select
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-vishipel-accent outline-none cursor-pointer"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="" className="text-black">Tất cả</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="text-black">{dept}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-green-900/60 text-green-300 border border-green-500/40 rounded-lg hover:bg-green-900 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
                >
                  <Plus size={16} /> Thêm Người
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={onDeleteAllParticipants}
                    className="px-4 py-2 bg-red-900/60 text-red-300 border border-red-500/40 rounded-lg hover:bg-red-900 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
                  >
                    <Trash2 size={16} /> Xóa Hết
                  </button>
                  <button
                    onClick={onResetWinners}
                    className="px-4 py-2 bg-yellow-900/50 text-yellow-300 border border-yellow-500/30 rounded-lg hover:bg-yellow-900 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
                  >
                    <RotateCcw size={16} /> Reset
                  </button>
                  <button
                    onClick={onRestoreDefaults}
                    className="px-4 py-2 bg-blue-900/50 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-900 hover:text-white flex items-center gap-2 text-xs font-bold uppercase"
                  >
                    <DatabaseBackup size={16} /> Khôi phục
                  </button>
                </div>
              </div>

              {/* Add Participant Form */}
              {showAddForm && (
                <div className="mb-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                  <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Plus size={18} /> Thêm người tham gia mới
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500 outline-none"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <select
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-green-500 outline-none"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept} className="bg-gray-800 text-white">{dept}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddParticipant}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddForm(false);
                        setNewName('');
                        setNewDept(DEPARTMENTS[0]);
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto rounded-lg border border-white/10 scrollbar-thin scrollbar-thumb-white/20">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/10 text-white font-bold sticky top-0 backdrop-blur-md z-10">
                    <tr>
                      <th className="p-4">Họ và tên</th>
                      <th className="p-4">Phòng ban/Đơn vị</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredParticipants.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">
                          Không tìm thấy người tham gia nào.
                        </td>
                      </tr>
                    ) : (
                      filteredParticipants.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4 font-medium text-white">
                            {editingId === p.id ? (
                              <input
                                className="bg-black/50 border border-white/20 rounded px-2 py-1 text-white w-full outline-none focus:border-blue-500"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                autoFocus
                              />
                            ) : p.name}
                          </td>
                          <td className="p-4">
                            {editingId === p.id ? (
                              <select
                                className="bg-black/50 border border-white/20 rounded px-2 py-1 text-white w-full outline-none focus:border-blue-500"
                                value={editDept}
                                onChange={e => setEditDept(e.target.value)}
                              >
                                {DEPARTMENTS.map(dept => (
                                  <option key={dept} value={dept} className="bg-gray-800 text-white">{dept}</option>
                                ))}
                              </select>
                            ) : p.department}
                          </td>
                          <td className="p-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {editingId === p.id ? (
                              <button onClick={saveEdit} className="text-green-400 hover:text-green-300 p-2 bg-green-900/20 rounded"><Save size={16} /></button>
                            ) : (
                              <button onClick={() => startEdit(p)} className="text-blue-400 hover:text-blue-300 p-2 hover:bg-white/5 rounded"><Edit2 size={16} /></button>
                            )}
                            <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-white/5 rounded"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === 'config' && (
            <div className="h-full overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawConfigs.map(config => (
                  <div key={config.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col gap-4 relative group">
                    <button
                      onClick={() => removeConfig(config.id)}
                      className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors p-2"
                    >
                      <X size={16} />
                    </button>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase">Tên giải (VD: Giải Nhất)</label>
                      <input
                        type="text"
                        value={config.label}
                        onChange={(e) => handleConfigChange(config.id, 'label', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-vishipel-accent outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={config.count}
                        onChange={(e) => handleConfigChange(config.id, 'count', parseInt(e.target.value) || 1)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-vishipel-accent outline-none font-mono text-lg"
                      />
                    </div>

                    {/* Remaining Count Display */}
                    <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 uppercase">Còn lại:</span>
                        <span className={`text-lg font-bold ${(() => {
                          // Count winners for this specific prize
                          const winnersForThisPrize = winners.filter(w => w.prizeLabel === config.label).length;
                          const remaining = config.count - winnersForThisPrize;
                          return remaining > 0 ? 'text-green-400' : 'text-red-400';
                        })()
                          }`}>
                          {(() => {
                            const winnersForThisPrize = winners.filter(w => w.prizeLabel === config.label).length;
                            return config.count - winnersForThisPrize;
                          })()} / {config.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addConfig}
                  className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-white hover:border-vishipel-accent hover:bg-vishipel-accent/5 transition-all min-h-[150px]"
                >
                  <Plus size={40} className="mb-2" />
                  <span className="font-semibold">Thêm cấu hình</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;