import React, { useState, useCallback, useEffect } from 'react';
import { Participant, Winner, DrawState, DrawConfig } from './types';
import { generateMockData, selectWinners } from './utils/lotteryLogic';
import { apiService } from './utils/apiService';
import Globe3D from './components/Globe3D';
import RegistrationModal from './components/RegistrationModal';
import WinnerDisplay from './components/WinnerDisplay';
import WinnersList from './components/WinnersList';
import AdminPanel from './components/AdminPanel';
import { Settings, UserPlus, Gift, Volume2, VolumeX, List, RefreshCw } from 'lucide-react';
import LoginScreen from './components/LoginScreen';
import { useAppSettings } from './utils/useAppSettings';

const App: React.FC = () => {
    // Auth State
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
        return !!localStorage.getItem('vishipel_token');
    });

    // State
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [currentRoundWinners, setCurrentRoundWinners] = useState<Winner[]>([]);

    const [drawState, setDrawState] = useState<DrawState>('idle');
    const [showWinnerModal, setShowWinnerModal] = useState(false);
    const [showWinnersList, setShowWinnersList] = useState(false);
    const [showRegModal, setShowRegModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);


    // Load app settings
    const { settings, loading: settingsLoading, reloadSettings } = useAppSettings();

    const [spinSpeed, setSpinSpeed] = useState(20); // Multiplier
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [drawCount, setDrawCount] = useState(1); // Number of times to draw
    const [selectedConfigId, setSelectedConfigId] = useState(''); // Selected draw config
    const [countdown, setCountdown] = useState(10); // Auto-refresh countdown

    // Draw Configuration State
    const [drawConfigs, setDrawConfigs] = useState<DrawConfig[]>([
        { id: '1', label: '1 Giải', count: 1 },
        { id: '2', label: '5 Giải', count: 5 },
        { id: '3', label: '10 Giải', count: 10 },
    ]);

    // Login Handler
    const handleLogin = (success: boolean) => {
        if (success) {
            localStorage.setItem('vishipel_auth', 'true');
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Bạn có muốn đăng xuất không?')) {
            localStorage.removeItem('vishipel_token');
            localStorage.removeItem('vishipel_auth'); // Cleanup old key
            window.location.reload();
        }
    };

    // Load initial data from API
    const fetchData = useCallback(async () => {
        try {
            const [participantsData, winnersData, configsData] = await Promise.all([
                apiService.getParticipants(),
                apiService.getWinners(),
                apiService.getDrawConfigs(),
            ]);

            setParticipants(participantsData);
            setWinners(winnersData);
            setDrawConfigs(configsData);
            // Set first config as default if not set
            if (!selectedConfigId && configsData.length > 0) {
                setSelectedConfigId(configsData[0].id);
            }
            console.log('✓ Đã tải dữ liệu từ API thành công');
        } catch (error) {
            console.warn('⚠️  Không thể kết nối đến Backend API. Đang sử dụng dữ liệu mẫu.');
            // Fallback to mock data if API is not available (only if empty)
            if (participants.length === 0) setParticipants(generateMockData());
        }
    }, [selectedConfigId, participants.length]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchData();

            // Auto-refresh every 10 seconds with visual countdown
            const timerInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        return 10;
                    }
                    return prev - 1;
                });
            }, 1000);

            const refreshInterval = setInterval(() => {
                fetchData();
            }, 10000);

            return () => {
                clearInterval(timerInterval);
                clearInterval(refreshInterval);
            };
        }
    }, [isLoggedIn, fetchData]);

    // Ensure when participants are deleted, they are also removed from winners if present
    useEffect(() => {
        if (participants.length > 0) {
            setWinners(prevWinners => {
                const validWinners = prevWinners.filter(w => participants.find(p => p.id === w.id));
                if (validWinners.length !== prevWinners.length) {
                    return validWinners;
                }
                return prevWinners;
            });
        }
    }, [participants]);

    if (!isLoggedIn) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    // Handlers
    const handleAddParticipant = async (name: string, dept: string) => {
        try {
            const newParticipant = await apiService.createParticipant(name, dept);
            // Update local state immediately for better UX
            setParticipants(prev => [...prev, newParticipant]);
        } catch (error: any) {
            alert(error.message || 'Có lỗi xảy ra khi thêm người tham gia');
        }
    };

    const handleDraw = async (configId: string, count: number, prizeName?: string, prizeLabel?: string) => {
        if (drawState !== 'idle') return;

        // drawCount = số lần quay, mỗi lần chọn 1 người
        const totalWinnersNeeded = drawCount;

        // Check if we have enough people
        const remainingCount = participants.length - winners.length;
        if (remainingCount < totalWinnersNeeded) {
            alert(`Không đủ người tham gia chưa trúng thưởng! Cần: ${totalWinnersNeeded}, Còn lại: ${remainingCount}`);
            return;
        }

        setDrawState('spinning');
        setSpinSpeed(50); // Fast spin

        // Determine winners immediately
        let allNewWinners: Winner[] = [];
        let currentWinners = [...winners];

        for (let i = 0; i < drawCount; i++) {
            const newWinnersData = selectWinners(participants, currentWinners, 1);
            const winnersWithTimestamp: Winner[] = newWinnersData.map(p => ({
                ...p,
                timestamp: Date.now()
            }));
            allNewWinners = [...allNewWinners, ...winnersWithTimestamp];
            currentWinners = [...currentWinners, ...winnersWithTimestamp];
        }

        // Stop sequence
        setTimeout(async () => {
            setDrawState('stopping');
            setSpinSpeed(5); // Slow down

            setTimeout(async () => {
                const roundWinners = allNewWinners.map(w => ({
                    ...w,
                    timestamp: Date.now(),
                    prizeName: prizeName,
                    prizeLabel: prizeLabel
                }));

                try {
                    // Save winners to API
                    await apiService.createWinners(roundWinners.map(w => w.id), parseInt(configId));
                } catch (error) {
                    console.error('Error saving winners:', error);
                }

                setCurrentRoundWinners(roundWinners);
                setWinners(prev => [...prev, ...roundWinners]);

                setDrawState('show-winner');
                setShowWinnerModal(true);
                setSpinSpeed(20); // Reset to idle drift

            }, 2000);
        }, 3000);
    };

    // Ensure when participants are deleted, they are also removed from winners if present
    // MOVED UP to avoid hook error
    // useEffect(() => { ... })

    const handleResetWinners = async () => {
        if (window.confirm('CẢNH BÁO: Thao tác này sẽ XÓA TOÀN BỘ danh sách trúng thưởng. Vòng quay sẽ bắt đầu lại từ đầu.')) {
            try {
                await apiService.deleteAllWinners();
                setWinners([]);
                setCurrentRoundWinners([]);
                setDrawState('idle');
            } catch (error) {
                console.error('Error resetting winners:', error);
                setWinners([]);
                setCurrentRoundWinners([]);
                setDrawState('idle');
            }
        }
    };

    const handleRestoreDefaults = async () => {
        if (window.confirm('CẢNH BÁO: Thao tác này sẽ XÓA TOÀN BỘ dữ liệu trên server và nạp lại danh sách mẫu. Bạn có chắc chắn không?')) {
            try {
                await apiService.deleteAllWinners();
                await apiService.deleteAllParticipants();

                const mockParticipants = generateMockData();
                const promises = mockParticipants.map(p => apiService.createParticipant(p.name, p.department));
                await Promise.all(promises);

                fetchData();
                alert("Đã khôi phục dữ liệu mẫu thành công lên Server!");
            } catch (error) {
                console.error("Error restoring defaults:", error);
                alert("Có lỗi khi khôi phục dữ liệu. Vui lòng kiểm tra console.");
            }
        }
    };

    const closeWinnerModal = () => {
        setShowWinnerModal(false);
        setDrawState('idle');
    };

    // Remaining participants calculation
    const remainingCount = participants.length - winners.length;
    // Filter out winners from the globe display
    const eligibleParticipants = participants.filter(p => !winners.find(w => w.id === p.id));

    return (
        <div className="relative w-full h-screen overflow-hidden font-sans select-none">

            {/* Header / Top Bar */}
            <div className="absolute top-0 left-0 w-full z-20 flex justify-between items-center p-6 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-4">
                    {/* Logo */}
                    <div className="p-2">
                        <img src={settings.logoUrl} alt={`${settings.companyName} Logo`} className="h-14 object-contain drop-shadow-2xl" />
                    </div>
                    {/* Company Name */}
                    <div className="text-white">
                        <h1 className="text-2xl font-bold drop-shadow-lg">{settings.companyName}</h1>
                        <p className="text-sm opacity-80">{settings.eventTitle} {settings.eventYear}</p>
                    </div>
                </div>

                <div className="pointer-events-auto flex gap-4">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className="glass-panel p-3 rounded-full hover:bg-white/20 transition-colors shadow-lg"
                    >
                        {soundEnabled ? <Volume2 size={20} className="text-white" /> : <VolumeX size={20} className="text-white" />}
                    </button>

                    <div className="glass-panel px-4 py-3 rounded-full flex items-center gap-2 shadow-lg text-white font-mono font-bold border border-white/20 bg-black/40">
                        <span className="text-yellow-400 text-lg w-6 text-center">{countdown}s</span>
                    </div>

                    <button
                        onClick={fetchData}
                        className="glass-panel p-3 rounded-full hover:bg-white/20 transition-colors shadow-lg text-white"
                        title="Tải lại dữ liệu"
                    >
                        <RefreshCw size={20} className={countdown <= 2 ? "animate-spin" : ""} />
                    </button>



                    <button
                        onClick={() => setShowAdminPanel(true)}
                        className="glass-panel p-3 rounded-full hover:bg-white/20 transition-colors text-white shadow-lg"
                        title="Cấu hình Admin"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={() => setShowWinnersList(true)}
                        className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors text-sm font-bold text-white shadow-lg border-white/40"
                        title="Danh sách"
                    >
                        <List size={18} /> Danh sách ({winners.length})
                    </button>

                    <button
                        onClick={() => setShowRegModal(true)}
                        className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white/20 transition-colors text-sm font-bold text-white shadow-lg border-white/40"
                    >
                        <UserPlus size={18} /> Check-in
                    </button>

                    <button
                        onClick={handleLogout}
                        className="glass-panel px-3 py-2 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-bold text-red-200 border-red-500/30"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>

            {/* Main 3D Globe Area */}
            <div className="absolute inset-0 z-0">
                <Globe3D
                    participants={eligibleParticipants}
                    isSpinning={drawState === 'spinning'}
                    speed={spinSpeed}
                />
            </div>

            {/* Bottom Control Bar */}
            <div className="absolute bottom-0 left-0 w-full z-20 p-8 flex flex-col items-center justify-end bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none">

                {/* Stats */}
                <div className="flex gap-8 mb-6 text-sm text-white font-medium pointer-events-auto drop-shadow-md bg-black/30 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                    <div className="text-center">
                        <span className="block text-2xl font-bold">{participants.length}</span>
                        <span className="uppercase text-[10px] text-gray-300">Tổng số</span>
                    </div>
                    <div className="w-px h-10 bg-white/30"></div>
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-yellow-400">{remainingCount}</span>
                        <span className="uppercase text-[10px] text-gray-300">Còn lại</span>
                    </div>
                    <div className="w-px h-10 bg-white/30"></div>
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-green-400">{winners.length}</span>
                        <span className="uppercase text-[10px] text-gray-300">Đã trúng</span>
                    </div>
                </div>

                {/* Dynamic Buttons */}
                <div className="flex gap-4 pointer-events-auto flex-wrap justify-center items-center">
                    {drawState === 'idle' ? (
                        <>
                            {/* Draw Count Selector */}
                            <div className="glass-panel px-4 py-3 rounded-xl border-white/30 flex items-center gap-3">
                                <label className="text-white text-sm font-bold">Số lần quay:</label>
                                <select
                                    value={drawCount}
                                    onChange={(e) => setDrawCount(parseInt(e.target.value))}
                                    className="px-3 py-1 bg-white/10 border border-white/30 rounded text-white font-bold focus:outline-none focus:border-yellow-400 cursor-pointer"
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                        <option key={num} value={num} className="bg-gray-800">{num}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Prize Selector */}
                            <div className="glass-panel px-4 py-3 rounded-xl border-white/30 flex items-center gap-3">
                                <label className="text-white text-sm font-bold">Chọn giải:</label>
                                <select
                                    value={selectedConfigId}
                                    onChange={(e) => setSelectedConfigId(e.target.value)}
                                    className="px-4 py-1 bg-white/10 border border-white/30 rounded text-white font-bold focus:outline-none focus:border-yellow-400 cursor-pointer min-w-[250px]"
                                >
                                    {drawConfigs.map(config => {
                                        const winnersForThisPrize = winners.filter(w => w.prizeLabel === config.label).length;
                                        const remaining = config.count - winnersForThisPrize;
                                        return (
                                            <option key={config.id} value={config.id} className="bg-gray-800">
                                                {config.label} ({remaining}/{config.count})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            {/* Main Draw Button */}
                            <button
                                onClick={() => {
                                    const config = drawConfigs.find(c => c.id === selectedConfigId);
                                    if (config) {
                                        const winnersForThisPrize = winners.filter(w => w.prizeLabel === config.label).length;
                                        const remaining = config.count - winnersForThisPrize;

                                        if (drawCount > remaining) {
                                            alert(`Không thể quay ${drawCount} lần!\nGiải "${config.label}" chỉ còn ${remaining} suất.`);
                                            return;
                                        }

                                        handleDraw(config.id, config.count, config.prizeName, config.label);
                                    }
                                }}
                                disabled={!selectedConfigId}
                                className="relative px-8 py-4 rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl bg-gradient-to-r from-red-600 to-red-800 border border-yellow-400/50 shadow-red-900/50 text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500"></div>
                                <span className="relative flex items-center gap-2 drop-shadow-md">
                                    <Gift size={24} className="text-yellow-300" />
                                    QUAY
                                    {drawCount > 1 && <span className="text-sm opacity-80">({drawCount}x)</span>}
                                </span>
                            </button>
                        </>
                    ) : (
                        <div className="px-12 py-4 glass-panel bg-red-900/60 rounded-xl text-yellow-400 font-bold animate-pulse text-xl tracking-widest border-yellow-500/50 shadow-[0_0_30px_rgba(255,215,0,0.4)] backdrop-blur-xl">
                            ĐANG QUAY...
                        </div>
                    )}
                </div>
            </div>

            {/* Modals are at the bottom */}
            <RegistrationModal
                isOpen={showRegModal}
                onClose={() => setShowRegModal(false)}
                onAddParticipant={handleAddParticipant}
            />

            <WinnerDisplay
                winners={currentRoundWinners}
                isVisible={showWinnerModal}
                onClose={closeWinnerModal}
            />

            <WinnersList
                winners={winners}
                participants={participants}
                isVisible={showWinnersList}
                onClose={() => setShowWinnersList(false)}
            />

            <AdminPanel
                isOpen={showAdminPanel}
                onClose={() => setShowAdminPanel(false)}
                participants={participants}
                setParticipants={setParticipants}
                drawConfigs={drawConfigs}
                setDrawConfigs={setDrawConfigs}
                winners={winners}
                onResetWinners={handleResetWinners}
                onRestoreDefaults={handleRestoreDefaults}
                onDeleteAllParticipants={async () => {
                    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn XÓA HẾT TẤT CẢ người tham gia không? Thao tác này không thể hoàn tác!')) {
                        try {
                            await apiService.deleteAllParticipants();
                            setParticipants([]);
                            setWinners([]);
                            setCurrentRoundWinners([]);
                        } catch (error: any) {
                            alert(error.message || 'Có lỗi xảy ra khi xóa tất cả người tham gia');
                        }
                    }
                }}
                reloadSettings={reloadSettings}
            />
        </div>
    );
};


export default App;
