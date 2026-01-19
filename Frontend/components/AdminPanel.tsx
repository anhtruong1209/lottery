import React, { useState, useEffect } from 'react';
import { Participant, DrawConfig, Winner, Department } from '../types';
import { apiService } from '../utils/apiService';
import { settingsService } from '../services/settingsService';
import { departmentsService } from '../services/departmentsService';
import { X, Trash2, Edit2, Plus, Save, RotateCcw, DatabaseBackup, Upload, Image as ImageIcon, Palette, Gift, Users, RefreshCw, Building, Music } from 'lucide-react';
// import { DEPARTMENTS } from '../utils/departments'; // Removed static

import { AppSettings } from '../utils/useAppSettings';

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
  reloadSettings: () => Promise<void>;
  settings: AppSettings;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen, onClose, participants, setParticipants, drawConfigs, setDrawConfigs, winners, onResetWinners, onRestoreDefaults, onDeleteAllParticipants, reloadSettings, settings
}) => {
  const [activeTab, setActiveTab] = useState<'participants' | 'departments' | 'config' | 'ui'>('participants');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');

  // Departments State
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDeptName, setNewDeptName] = useState('');

  // Add participant state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDepartments();
    }
  }, [isOpen]);

  const loadDepartments = async () => {
    try {
      const data = await departmentsService.getDepartments();
      setDepartments(data);
      if (data.length > 0 && !newDept) setNewDept(data[0].name);
    } catch (e) {
      console.error("Failed to load departments", e);
    }
  }

  // UI Settings State
  const [uiLoading, setUiLoading] = useState(false);
  const [uiUploading, setUiUploading] = useState<string | null>(null);
  const [uiMessage, setUiMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [eventTitle, setEventTitle] = useState(settings.eventTitle);
  const [eventYear, setEventYear] = useState(settings.eventYear);
  const [logoPreview, setLogoPreview] = useState(settings.logoUrl);
  const [backgroundPreview, setBackgroundPreview] = useState(settings.backgroundUrl);
  const [musicPreview, setMusicPreview] = useState(settings.musicUrl);

  // Update local state when settings prop changes
  useEffect(() => {
    setCompanyName(settings.companyName);
    setEventTitle(settings.eventTitle);
    setEventYear(settings.eventYear);
    setLogoPreview(settings.logoUrl);
    setBackgroundPreview(settings.backgroundUrl);
    setMusicPreview(settings.musicUrl);
  }, [settings]);

  // Removed internal loadSettings which caused the delay
  // ...

  const showUiMessage = (type: 'success' | 'error', text: string) => {
    setUiMessage({ type, text });
    setTimeout(() => setUiMessage(null), 3000);
  };

  if (!isOpen) return null;

  // --- Participant Logic ---
  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept ? p.department === filterDept : true;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id: string) => {
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
      setParticipants(prev => [newParticipant, ...prev]);
      setNewName('');
      setNewDept(departments[0]?.name || '');
      setShowAddForm(false);
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi thêm người tham gia');
    }
  };

  // --- Config Logic ---
  const handleConfigChange = async (id: string, field: keyof DrawConfig, value: string | number) => {
    const config = drawConfigs.find(c => c.id === id);
    if (!config) return;

    // Local update first for UI responsiveness
    setDrawConfigs(prev => prev.map(c =>
      c.id === id ? { ...c, [field]: value } : c
    ));

    try {
      // We need to pass the FULL up-to-date object or the specific fields to the API
      // Currently API expects { Label, Count, PrizeName }
      const updatedConfig = { ...config, [field]: value };

      await apiService.updateDrawConfig(id, updatedConfig.label, updatedConfig.count, updatedConfig.prizeName);
    } catch (error: any) {
      console.error("Update config failed", error);
      // Revert on failure could be added here
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

  // --- UI Settings Logic ---
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showUiMessage('error', 'File quá lớn! Tối đa 5MB'); return; }
    if (!file.type.startsWith('image/')) { showUiMessage('error', 'Chỉ chấp nhận file ảnh!'); return; }

    try {
      setUiUploading('logo');
      const response = await settingsService.uploadLogo(file);
      if (response.success && response.url) {
        setLogoPreview(response.url);
        showUiMessage('success', 'Upload logo thành công!');
        await reloadSettings();
      } else {
        showUiMessage('error', response.message || 'Upload thất bại');
      }
    } catch (error) {
      showUiMessage('error', 'Lỗi khi upload logo');
    } finally {
      setUiUploading(null);
    }
  };

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showUiMessage('error', 'File quá lớn! Tối đa 5MB'); return; }
    if (!file.type.startsWith('image/')) { showUiMessage('error', 'Chỉ chấp nhận file ảnh!'); return; }

    try {
      setUiUploading('background');
      const response = await settingsService.uploadBackground(file);
      if (response.success && response.url) {
        setBackgroundPreview(response.url);
        showUiMessage('success', 'Upload background thành công!');
        await reloadSettings();
      } else {
        showUiMessage('error', response.message || 'Upload thất bại');
      }
    } catch (error) {
      showUiMessage('error', 'Lỗi khi upload background');
    } finally {
      setUiUploading(null);
    }
  };

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { showUiMessage('error', 'File quá lớn! Tối đa 10MB'); return; }
    if (!file.type.startsWith('audio/')) { showUiMessage('error', 'Chỉ chấp nhận file âm thanh (MP3, WAV)!'); return; }

    try {
      setUiUploading('music');
      const response = await settingsService.uploadMusic(file);
      if (response.success && response.url) {
        setMusicPreview(response.url);
        showUiMessage('success', 'Upload nhạc thành công!');
        await reloadSettings();
      } else {
        showUiMessage('error', response.message || 'Upload thất bại');
      }
    } catch (error) {
      showUiMessage('error', 'Lỗi khi upload nhạc');
    } finally {
      setUiUploading(null);
    }
  };

  const handleSaveUiSettings = async () => {
    try {
      // setUiLoading(true); // Don't block UI for auto-save, just background
      await Promise.all([
        settingsService.updateSetting('company_name', companyName),
        settingsService.updateSetting('event_title', eventTitle),
        settingsService.updateSetting('event_year', eventYear),
      ]);
      // showUiMessage('success', 'Đã lưu cấu hình!'); // Optional: reduce noise
      await reloadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      showUiMessage('error', 'Lỗi khi lưu cấu hình');
    } finally {
      // setUiLoading(false);
    }
  };

  const handleBlurSave = () => {
    handleSaveUiSettings();
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      const dept = await departmentsService.createDepartment(newDeptName);
      setDepartments(prev => [...prev, dept]);
      setNewDeptName('');
    } catch (e) {
      alert('Có lỗi khi thêm phòng ban');
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!window.confirm('Xóa phòng ban này?')) return;
    try {
      await departmentsService.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      alert('Có lỗi khi xóa phòng ban');
    }
  };

  // ... (rest of logic)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-2xl flex flex-col overflow-hidden border-white/20 shadow-2xl bg-[#0F172A]">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <span className="bg-blue-600 px-3 py-1 rounded text-sm font-mono">ADMIN</span>
            Quản trị hệ thống
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/20">
          <button onClick={() => setActiveTab('participants')} className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'participants' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Users size={18} /> Danh sách ({participants.length})
          </button>
          <button onClick={() => setActiveTab('departments')} className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'departments' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Building size={18} /> Phòng ban
          </button>
          <button onClick={() => setActiveTab('config')} className={`flex items-center gap-2 px-6 py-4 font-semibold text-sm transition-all ${activeTab === 'config' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            <Gift size={18} /> Cấu hình giải thưởng
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`flex items-center gap-2 px-8 py-4 font-semibold text-sm transition-all ${activeTab === 'ui' ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Palette size={18} />
            Giao diện
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">

          {/* PARTICIPANTS TAB */}
          {activeTab === 'participants' && (
            <div className="h-full flex flex-col p-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="mb-4 flex gap-4 flex-wrap items-start">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none min-w-[200px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-blue-500 outline-none cursor-pointer"
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  <option value="" className="text-black">Tất cả phòng ban</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.name} className="text-black">{dept.name}</option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-bold shadow-lg shadow-green-900/20"
                >
                  <Plus size={16} /> Thêm Người
                </button>

                <div className="flex gap-2 ml-auto">
                  <button onClick={onDeleteAllParticipants} title="Xóa hết" className="p-2 bg-red-900/40 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-900 hover:text-white transition-colors">
                    <Trash2 size={18} />
                  </button>
                  <button onClick={onResetWinners} title="Reset người trúng" className="p-2 bg-yellow-900/40 text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-900 hover:text-white transition-colors">
                    <RotateCcw size={18} />
                  </button>
                  <button onClick={onRestoreDefaults} title="Khôi phục dữ liệu mẫu" className="p-2 bg-blue-900/40 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-900 hover:text-white transition-colors">
                    <DatabaseBackup size={18} />
                  </button>
                </div>
              </div>

              {showAddForm && (
                <div className="mb-4 p-4 bg-green-900/10 border border-green-500/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                  <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                    <Plus size={18} /> Thêm người tham gia mới
                  </h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      className="flex-1 bg-black/40 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:border-green-500 outline-none"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                    <select
                      className="flex-1 bg-black/40 border border-green-500/30 rounded-lg px-4 py-2 text-white focus:border-green-500 outline-none"
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                    >
                      <option value="">Chọn phòng ban</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name} className="bg-gray-900 text-white">{dept.name}</option>
                      ))}
                    </select>
                    <button onClick={handleAddParticipant} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold shadow-lg">Thêm</button>
                    <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">Hủy</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto rounded-lg border border-white/10 bg-black/20 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-white font-bold sticky top-0 backdrop-blur-md z-10 shadow-sm">
                    <tr>
                      <th className="p-4 w-[40%]">Họ và tên</th>
                      <th className="p-4 w-[40%]">Phòng ban/Đơn vị</th>
                      <th className="p-4 w-[20%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredParticipants.length === 0 ? (
                      <tr><td colSpan={3} className="p-12 text-center text-gray-500 italic">Không tìm thấy người tham gia nào.</td></tr>
                    ) : (
                      filteredParticipants.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                          <td className="p-4 font-medium text-white">
                            {editingId === p.id ? (
                              <input className="bg-black/50 border border-blue-500 rounded px-2 py-1 text-white w-full outline-none" value={editName} onChange={e => setEditName(e.target.value)} autoFocus />
                            ) : p.name}
                          </td>
                          <td className="p-4">
                            {editingId === p.id ? (
                              <select className="bg-black/50 border border-blue-500 rounded px-2 py-1 text-white w-full outline-none" value={editDept} onChange={e => setEditDept(e.target.value)}>
                                {departments.map(dept => <option key={dept.id} value={dept.name} className="bg-gray-900">{dept.name}</option>)}
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

          {/* DEPARTMENTS TAB */}
          {activeTab === 'departments' && (
            <div className="h-full flex flex-col p-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10 flex gap-4 items-center">
                <input
                  type="text"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="Nhập tên phòng ban mới..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none"
                />
                <button onClick={handleAddDepartment} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold flex items-center gap-2 transition-colors">
                  <Plus size={20} /> Thêm
                </button>
                <button onClick={() => departmentsService.seedDepartments().then(loadDepartments)} className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold flex items-center gap-2 transition-colors" title="Khôi phục danh sách mẫu">
                  <DatabaseBackup size={20} /> Mẫu
                </button>
              </div>

              <div className="flex-1 overflow-y-auto rounded-xl border border-white/10 bg-black/20">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-white/5 text-white font-bold sticky top-0 backdrop-blur-md z-10">
                    <tr>
                      <th className="p-4 w-[10%]">ID</th>
                      <th className="p-4 w-[70%]">Tên Phòng Ban</th>
                      <th className="p-4 w-[20%] text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {departments.map(dept => (
                      <tr key={dept.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 text-gray-500">#{dept.id}</td>
                        <td className="p-4 font-medium text-white">{dept.name}</td>
                        <td className="p-4 flex justify-end">
                          <button onClick={() => handleDeleteDepartment(dept.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-500">Chưa có phòng ban nào.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === 'config' && (
            <div className="h-full overflow-y-auto p-6 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drawConfigs.map(config => (
                  <div key={config.id} className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col gap-4 relative group hover:border-blue-500/50 transition-colors shadow-lg">
                    <button
                      onClick={() => removeConfig(config.id)}
                      className="absolute top-2 right-2 text-white/20 hover:text-red-400 transition-colors p-2"
                    >
                      <X size={16} />
                    </button>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Tên giải (Label)</label>
                      <input
                        type="text"
                        value={config.label}
                        onChange={(e) => handleConfigChange(config.id, 'label', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors"
                        placeholder="VD: Giải Nhất"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Tên phần thưởng (Prize Name)</label>
                      <textarea
                        value={config.prizeName || ''}
                        onChange={(e) => handleConfigChange(config.id, 'prizeName', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-blue-500 outline-none transition-colors resize-none h-20 text-sm"
                        placeholder="VD: Xe máy Honda Vision..."
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Số lượng</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={config.count}
                          onChange={(e) => handleConfigChange(config.id, 'count', parseInt(e.target.value) || 1)}
                          className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-white focus:border-blue-500 outline-none font-mono text-lg text-center"
                        />
                      </div>
                      {/* Remaining Count Display */}
                      <div className="flex-1">
                        <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider font-bold">Còn lại</label>
                        <div className="px-3 py-2 bg-blue-900/20 border border-blue-500/30 rounded text-center">
                          <span className={`text-lg font-bold font-mono ${(() => {
                            const winnersForThisPrize = winners.filter(w => w.prizeLabel === config.label).length;
                            const remaining = config.count - winnersForThisPrize;
                            return remaining > 0 ? 'text-green-400' : 'text-red-400';
                          })()
                            }`}>
                            {(() => {
                              const winnersForThisPrize = winners.filter(w => w.prizeLabel === config.label).length;
                              return config.count - winnersForThisPrize;
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addConfig}
                  className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:text-white hover:border-blue-500 hover:bg-blue-500/5 transition-all min-h-[250px] group"
                >
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                    <Plus size={32} />
                  </div>
                  <span className="font-semibold text-lg">Thêm cấu hình</span>
                </button>
              </div>
            </div>
          )}

          {/* UI SETTINGS TAB */}
          {activeTab === 'ui' && (
            <div className="h-full overflow-y-auto p-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="max-w-4xl mx-auto space-y-8">
                {uiMessage && (
                  <div className={`p-4 rounded-lg flex items-center gap-3 ${uiMessage.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                    {uiMessage.type === 'success' ? <div className="w-2 h-2 rounded-full bg-green-400" /> : <div className="w-2 h-2 rounded-full bg-red-400" />}
                    {uiMessage.text}
                  </div>
                )}

                {/* Section 1: Branding */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
                    <Palette size={20} className="text-blue-400" />
                    Thông tin thương hiệu
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Tên công ty</label>
                        <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} onBlur={handleBlurSave} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="VISHIPEL" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Tiêu đề sự kiện</label>
                        <input type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} onBlur={handleBlurSave} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="CHƯƠNG TRÌNH QUAY THƯỞNG" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Năm tổ chức</label>
                        <input type="text" value={eventYear} onChange={e => setEventYear(e.target.value)} onBlur={handleBlurSave} className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" placeholder="2026" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
                      <ImageIcon size={20} className="text-green-400" />
                      Logo
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-40 h-40 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center bg-black/20 p-4">
                        {logoPreview ? <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" /> : <ImageIcon className="text-gray-600" size={40} />}
                      </div>
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Upload size={16} />
                        {uiUploading === 'logo' ? 'Đang tải lên...' : 'Chọn Logo Mới'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uiUploading === 'logo'} />
                      </label>
                      <p className="text-xs text-gray-500">PNG, JPG, SVG (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Background */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
                      <ImageIcon size={20} className="text-purple-400" />
                      Hình nền
                    </h3>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-full h-40 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center bg-black/20 relative overflow-hidden group">
                        {backgroundPreview ? (
                          <img src={backgroundPreview} alt="Bg" className="w-full h-full object-cover opacity-80" />
                        ) : <ImageIcon className="text-gray-600" size={40} />}
                      </div>
                      <label className="cursor-pointer bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Upload size={16} />
                        {uiUploading === 'background' ? 'Đang tải lên...' : 'Chọn Hình Nền Mới'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} disabled={uiUploading === 'background'} />
                      </label>
                      <p className="text-xs text-gray-500">1920x1080px (Max 5MB)</p>
                    </div>
                  </div>

                  {/* Music */}
                  <div className="column-span-2 md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 pb-4 border-b border-white/10">
                      <Music size={20} className="text-yellow-400" />
                      Nhạc nền
                    </h3>
                    <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="flex-1 w-full">
                        <div className="w-full h-20 border-2 border-dashed border-white/20 rounded-xl flex items-center justify-center bg-black/20 text-gray-500">
                          {musicPreview ? (
                            <div className="flex items-center gap-3 text-green-400 font-bold">
                              <Music size={24} />
                              <span>Đã có nhạc nền</span>
                            </div>
                          ) : (
                            <span>Chưa có nhạc</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <label className="cursor-pointer bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-yellow-900/20 font-bold">
                          <Upload size={18} />
                          {uiUploading === 'music' ? 'Đang tải lên...' : 'Upload Nhạc MP3'}
                          <input type="file" accept="audio/*" className="hidden" onChange={handleMusicUpload} disabled={uiUploading === 'music'} />
                        </label>
                        <p className="text-xs text-center text-gray-500">MP3, WAV (Max 10MB)</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions - Removed Save Button as requested */}
                {/* <div className="flex justify-end pt-4">
                  <button onClick={handleSaveUiSettings} ... > Lưu Cấu Hình </button>
                </div> */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;