import React, { useState, useEffect } from 'react';
import { Settings, Upload, X, Save, Image as ImageIcon } from 'lucide-react';
import { settingsService } from '../services/settingsService';
import { AppSetting } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSettingsUpdated?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSettingsUpdated }) => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [companyName, setCompanyName] = useState('');
    const [eventTitle, setEventTitle] = useState('');
    const [eventYear, setEventYear] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#1e40af');
    const [secondaryColor, setSecondaryColor] = useState('#3b82f6');
    const [logoPreview, setLogoPreview] = useState('');
    const [backgroundPreview, setBackgroundPreview] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settingsDict = await settingsService.getSettingsDictionary();
            setSettings(settingsDict);

            // Populate form
            setCompanyName(settingsDict.company_name || 'VISHIPEL');
            setEventTitle(settingsDict.event_title || 'CHƯƠNG TRÌNH QUAY THƯỞNG');
            setEventYear(settingsDict.event_year || '2026');
            setPrimaryColor(settingsDict.primary_color || '#1e40af');
            setSecondaryColor(settingsDict.secondary_color || '#3b82f6');
            setLogoPreview(settingsDict.logo_url || '/images/default-logo.png');
            setBackgroundPreview(settingsDict.background_url || '/images/default-bg.jpg');
        } catch (error) {
            console.error('Error loading settings:', error);
            showMessage('error', 'Không thể tải cấu hình');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'File quá lớn! Tối đa 5MB');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Chỉ chấp nhận file ảnh!');
            return;
        }

        try {
            setUploading('logo');
            const response = await settingsService.uploadLogo(file);

            if (response.success && response.url) {
                setLogoPreview(response.url);
                showMessage('success', 'Upload logo thành công!');
            } else {
                showMessage('error', response.message || 'Upload thất bại');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
            showMessage('error', 'Lỗi khi upload logo');
        } finally {
            setUploading(null);
        }
    };

    const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showMessage('error', 'File quá lớn! Tối đa 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            showMessage('error', 'Chỉ chấp nhận file ảnh!');
            return;
        }

        try {
            setUploading('background');
            const response = await settingsService.uploadBackground(file);

            if (response.success && response.url) {
                setBackgroundPreview(response.url);
                showMessage('success', 'Upload background thành công!');
            } else {
                showMessage('error', response.message || 'Upload thất bại');
            }
        } catch (error) {
            console.error('Error uploading background:', error);
            showMessage('error', 'Lỗi khi upload background');
        } finally {
            setUploading(null);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Update all settings
            await Promise.all([
                settingsService.updateSetting('company_name', companyName),
                settingsService.updateSetting('event_title', eventTitle),
                settingsService.updateSetting('event_year', eventYear),
                settingsService.updateSetting('primary_color', primaryColor),
                settingsService.updateSetting('secondary_color', secondaryColor),
            ]);

            showMessage('success', 'Lưu cấu hình thành công!');

            // Notify parent to reload settings
            if (onSettingsUpdated) {
                onSettingsUpdated();
            }

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            console.error('Error saving settings:', error);
            showMessage('error', 'Lỗi khi lưu cấu hình');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <Settings className="w-6 h-6 text-blue-600" />
                        <h2 className="text-2xl font-bold text-gray-800">Cấu Hình Giao Diện</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Message */}
                {message && (
                    <div className={`mx-6 mt-4 p-3 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {message.text}
                    </div>
                )}

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">📝 Thông Tin Công Ty</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên công ty
                                </label>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="VISHIPEL"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tiêu đề sự kiện
                                </label>
                                <input
                                    type="text"
                                    value={eventTitle}
                                    onChange={(e) => setEventTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="CHƯƠNG TRÌNH QUAY THƯỞNG"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Năm sự kiện
                                </label>
                                <input
                                    type="text"
                                    value={eventYear}
                                    onChange={(e) => setEventYear(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="2026"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">🖼️ Logo Công Ty</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    {uploading === 'logo' ? 'Đang upload...' : 'Upload Logo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="hidden"
                                        disabled={uploading === 'logo'}
                                    />
                                </label>
                                <p className="text-sm text-gray-500 mt-2">
                                    Định dạng: JPG, PNG, GIF, WebP<br />
                                    Kích thước tối đa: 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Background Upload */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">🎨 Ảnh Background</h3>
                        <div className="flex items-center gap-4">
                            <div className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                {backgroundPreview ? (
                                    <img src={backgroundPreview} alt="Background" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="w-12 h-12 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    {uploading === 'background' ? 'Đang upload...' : 'Upload Background'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBackgroundUpload}
                                        className="hidden"
                                        disabled={uploading === 'background'}
                                    />
                                </label>
                                <p className="text-sm text-gray-500 mt-2">
                                    Định dạng: JPG, PNG, GIF, WebP<br />
                                    Kích thước tối đa: 5MB
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Theme Colors */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">🎨 Màu Sắc Theme</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Màu chính
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Màu phụ
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="w-12 h-10 rounded cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={secondaryColor}
                                        onChange={(e) => setSecondaryColor(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || uploading !== null}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};
