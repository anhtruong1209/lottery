import React, { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (success: boolean) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await import('../utils/apiService').then(async ({ apiService }) => {
                const response = await apiService.login(username, password);
                if (response && response.token) {
                    localStorage.setItem('vishipel_token', response.token);
                    onLogin(true);
                } else {
                    setError('Đăng nhập thất bại: Không nhận được token');
                }
            });
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black/90 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] animate-pulse"></div>
            </div>

            <div className="glass-panel p-8 rounded-2xl w-full max-w-md z-10 border border-white/10 relative">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-white/5 rounded-full ring-1 ring-white/20">
                        <Lock size={32} className="text-yellow-400" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center text-white mb-6 uppercase tracking-widest">Đăng Nhập Hệ Thống</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Tên đăng nhập</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                            placeholder="Nhập tên đăng nhập"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                            placeholder="Nhập mật khẩu"
                        />
                    </div>

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        ĐĂNG NHẬP
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
