import { AppSetting, UpdateSettingDto, FileUploadResponse } from '../types';
import { apiService } from '../utils/apiService';

class SettingsService {
    // Get all settings
    async getSettings(): Promise<AppSetting[]> {
        const response = await fetch(`${apiService.baseUrl}/appsettings`);
        if (!response.ok) throw new Error('Failed to fetch settings');
        return response.json();
    }

    // Get settings as dictionary
    async getSettingsDictionary(): Promise<Record<string, string>> {
        try {
            const settings = await this.getSettings();
            const dict: Record<string, string> = {};
            settings.forEach(s => {
                dict[s.settingKey] = s.settingValue || '';
            });

            // Map keys to match UI expectations if differ
            return {
                company_name: dict['CompanyName'] || '',
                event_title: dict['EventTitle'] || '',
                event_year: dict['EventYear'] || '',
                primary_color: dict['PrimaryColor'] || '',
                secondary_color: dict['SecondaryColor'] || '',
                logo_url: dict['CompanyLogo'] || '',
                background_url: dict['BackgroundImage'] || '',
                background_music: dict['BackgroundMusic'] || ''
            };
        } catch (e) {
            console.error(e);
            return {};
        }
    }

    // Get single setting by key
    async getSetting(key: string): Promise<AppSetting> {
        const response = await fetch(`${apiService.baseUrl}/appsettings/key/${key}`);
        if (!response.ok) throw new Error(`Failed to fetch setting: ${key}`);
        return response.json();
    }

    // Update setting (admin only)
    async updateSetting(key: string, value: string, updatedBy?: string): Promise<void> {
        // Map UI keys to Backend keys
        const keyMap: Record<string, string> = {
            'company_name': 'CompanyName',
            'event_title': 'EventTitle',
            'event_year': 'EventYear',
            'primary_color': 'PrimaryColor',
            'secondary_color': 'SecondaryColor',
            'logo_url': 'CompanyLogo',
            'background_url': 'BackgroundImage',
            'background_music': 'BackgroundMusic'
        };

        const backendKey = keyMap[key] || key;

        // Check if setting exists first, if not create it
        try {
            await this.getSetting(backendKey);
            // Exists, update it
            await apiService.put(`/appsettings/key/${backendKey}`, { value, updatedBy });
        } catch (error) {
            console.error('Update failed, trying create:', error);
            // Likely 404, create it
            try {
                await apiService.post('/appsettings', {
                    settingKey: backendKey,
                    settingValue: value,
                    settingType: 'text', // default
                    updatedBy
                });
            } catch (createError) {
                console.error('Create also failed:', createError);
                throw createError;
            }
        }
    }

    // Convert file to Base64
    private toBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }

    private async uploadFile(file: File, key: string): Promise<FileUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('key', key);

        try {
            const response = await fetch(`${apiService.baseUrl}/appsettings/upload-file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('vishipel_token')}`
                },
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Upload failed');
            }
            return await response.json();
        } catch (error: any) {
            console.error('Upload file error:', error);
            return { success: false, message: error.message || 'Upload failed' };
        }
    }

    // Upload logo (admin only)
    async uploadLogo(file: File): Promise<FileUploadResponse> {
        return this.uploadFile(file, 'CompanyLogo');
    }

    // Upload background (admin only)
    async uploadBackground(file: File): Promise<FileUploadResponse> {
        return this.uploadFile(file, 'BackgroundImage');
    }

    // Upload music (admin only)
    async uploadMusic(file: File): Promise<FileUploadResponse> {
        return this.uploadFile(file, 'BackgroundMusic');
    }
}

export const settingsService = new SettingsService();
