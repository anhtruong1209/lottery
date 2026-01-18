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
        const response = await fetch(`${apiService.baseUrl}/appsettings/dictionary`);
        if (!response.ok) throw new Error('Failed to fetch settings dictionary');
        return response.json();
    }

    // Get single setting by key
    async getSetting(key: string): Promise<AppSetting> {
        const response = await fetch(`${apiService.baseUrl}/appsettings/${key}`);
        if (!response.ok) throw new Error(`Failed to fetch setting: ${key}`);
        return response.json();
    }

    // Update setting (admin only)
    async updateSetting(key: string, value: string, updatedBy?: string): Promise<{ success: boolean; setting: AppSetting }> {
        const token = localStorage.getItem('vishipel_token');
        const response = await fetch(`${apiService.baseUrl}/appsettings/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ value, updatedBy } as UpdateSettingDto)
        });

        if (!response.ok) throw new Error(`Failed to update setting: ${key}`);
        return response.json();
    }

    // Upload logo (admin only)
    async uploadLogo(file: File): Promise<FileUploadResponse> {
        const token = localStorage.getItem('vishipel_token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiService.baseUrl}/appsettings/upload-logo`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload logo');
        return response.json();
    }

    // Upload background (admin only)
    async uploadBackground(file: File): Promise<FileUploadResponse> {
        const token = localStorage.getItem('vishipel_token');
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${apiService.baseUrl}/appsettings/upload-background`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload background');
        return response.json();
    }
}

export const settingsService = new SettingsService();
