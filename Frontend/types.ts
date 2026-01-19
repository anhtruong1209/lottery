export interface Participant {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

export interface Winner extends Participant {
  timestamp: number;
  prizeName?: string;
  prizeLabel?: string;
}

export interface DrawConfig {
  id: string;
  label: string;
  count: number;
  prizeName?: string;
  displayOrder?: number;
}

export type DrawState = 'idle' | 'spinning' | 'stopping' | 'show-winner';

// App Settings
export interface AppSetting {
  id: number;
  settingKey: string;
  settingValue: string | null;
  settingType: string;
  description: string | null;
  updatedAt: string;
  updatedBy: string | null;
}

export interface UpdateSettingDto {
  value: string;
  updatedBy?: string;
}

export interface FileUploadResponse {
  success: boolean;
  url?: string;
  message?: string;
}

export interface Department {
  id: number;
  name: string;
  createdAt: string;
}