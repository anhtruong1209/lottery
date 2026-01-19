import React, { useState, useEffect } from 'react';
import { CheckCircle, Send } from 'lucide-react';
import { apiService } from '../utils/apiService';
import { departmentsService } from '../services/departmentsService';
import { useAppSettings } from '../utils/useAppSettings';
import { Department } from '../types';

const ParticipantLookup: React.FC = () => {
    // Branding
    const { settings } = useAppSettings();

    // Input State
    const [name, setName] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [department, setDepartment] = useState(''); // Stores name directly for simplicity
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadDeps = async () => {
            try {
                const data = await departmentsService.getDepartments();
                setDepartments(data);
                if (data.length > 0) setDepartment(data[0].name);
            } catch (e) {
                console.error("Failed to load departments", e);
            }
        };
        loadDeps();
    }, []);

    // Simple submission - No search, just add
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !department.trim()) return;

        setLoading(true);
        try {
            // Create user directly - Backend handles duplicates (free entry)
            await apiService.createParticipant(name, department);
            setSuccess(true);
            // Auto Reset after 3 seconds so next person can scan? 
            // Or just stay success. User said "quét là ra luôn" implying simplicity.
        } catch (error: any) {
            console.error('Error creating participant:', error);
            alert(`Lỗi: ${error.message || 'Có lỗi xảy ra, vui lòng thử lại!'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSuccess(false);
        setName('');
        setDepartment(departments[0]?.name || '');
    };

    return (
        <div
            className="min-h-screen p-4 font-sans overflow-y-auto flex flex-col items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: settings.backgroundUrl ? `url(${settings.backgroundUrl})` : undefined,
                backgroundColor: !settings.backgroundUrl ? '#7f1d1d' : undefined // Fallback color
            }}
        >
            {/* Overlay if image is presents to ensure text contrast */}
            <div className="absolute inset-0 bg-black/40 z-0" />

            <div className="w-full max-w-md z-10 relative">
                {/* Logo Area */}
                <div className="text-center mb-8 animate-fade-in-down flex flex-col items-center justify-center gap-4">
                    <img
                        src={settings.logoUrl}
                        alt="Logo"
                        className="h-24 object-contain drop-shadow-xl"
                    />
                    <h1 className="text-2xl font-bold text-white uppercase drop-shadow-md text-center leading-tight">
                        {settings.companyName}
                        <br />
                        <span className="text-lg font-normal text-yellow-300">{settings.eventTitle}</span>
                    </h1>
                </div>

                {!success ? (
                    /* STEP 1: INPUT FORM */
                    <div className="glass-panel p-8 rounded-3xl shadow-2xl border border-white/10 animate-fade-in-up backdrop-blur-sm bg-white/5">
                        <p className="text-yellow-200/80 text-lg font-light tracking-wide text-center mb-6 uppercase">
                            Check-in Tham Dự
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-yellow-100 text-sm font-bold mb-2 uppercase tracking-wider ml-1">Họ và Tên</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nhập tên của bạn..."
                                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium text-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-yellow-100 text-sm font-bold mb-2 uppercase tracking-wider ml-1">Phòng ban / Đơn vị</label>
                                <select
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                    className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all font-medium text-lg appearance-none cursor-pointer"
                                >
                                    <option value="" className="text-black">-- Chọn Phòng ban --</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.name} className="text-black">{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !name || !department}
                                className="w-full py-4 mt-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-yellow-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xl"
                            >
                                {loading ? (
                                    <span>Đang xử lý...</span>
                                ) : (
                                    <>
                                        Xác Nhận <Send size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    /* STEP 2: SUCCESS */
                    <div className="glass-panel p-10 rounded-3xl shadow-2xl border border-green-400/30 animate-fade-in-up relative backdrop-blur-sm bg-white/5 text-center">

                        <div className="mb-6 flex justify-center">
                            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500">
                                <CheckCircle size={48} className="text-green-400" />
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">Check-in Thành Công!</h2>
                        <p className="text-white/80 text-lg mb-8">
                            Chào mừng <span className="text-yellow-400 font-bold">{name}</span><br />
                            <span className="text-sm opacity-70">({department})</span>
                        </p>

                        <button
                            onClick={handleReset}
                            className="text-white/50 hover:text-white text-sm underline transition-colors"
                        >
                            Quay lại màn hình chính
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParticipantLookup;
