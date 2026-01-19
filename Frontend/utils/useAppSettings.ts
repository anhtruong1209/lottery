import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

export interface AppSettings {
    companyName: string;
    logoUrl: string;
    backgroundUrl: string;
    musicUrl: string;
    primaryColor: string;
    secondaryColor: string;
    eventTitle: string;
    eventYear: string;
}

const DEFAULT_SETTINGS: AppSettings = {
    companyName: 'VISHIPEL',
    logoUrl: '/logo.png',
    backgroundUrl: '/images/default-bg.jpg',
    musicUrl: '',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    eventTitle: 'CHƯƠNG TRÌNH QUAY THƯỞNG',
    eventYear: '2026'
};

export const useAppSettings = () => {
    const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settingsDict = await settingsService.getSettingsDictionary();

            setSettings({
                companyName: settingsDict.company_name || DEFAULT_SETTINGS.companyName,
                logoUrl: settingsDict.logo_url || DEFAULT_SETTINGS.logoUrl,
                backgroundUrl: settingsDict.background_url || DEFAULT_SETTINGS.backgroundUrl,
                musicUrl: settingsDict.background_music || DEFAULT_SETTINGS.musicUrl,
                primaryColor: settingsDict.primary_color || DEFAULT_SETTINGS.primaryColor,
                secondaryColor: settingsDict.secondary_color || DEFAULT_SETTINGS.secondaryColor,
                eventTitle: settingsDict.event_title || DEFAULT_SETTINGS.eventTitle,
                eventYear: settingsDict.event_year || DEFAULT_SETTINGS.eventYear,
            });
        } catch (error) {
            console.error('Error loading settings:', error);
            // Keep default settings on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return { settings, loading, reloadSettings: loadSettings };
};
