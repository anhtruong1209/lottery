import FingerprintJS from '@fingerprintjs/fingerprintjs';

class DeviceFingerprintService {
    private fpPromise: Promise<any> | null = null;
    private cachedFingerprint: string | null = null;

    async getFingerprint(): Promise<string> {
        // Return cached fingerprint if available
        if (this.cachedFingerprint) {
            return this.cachedFingerprint;
        }

        // Check localStorage
        const stored = localStorage.getItem('deviceFingerprint');
        if (stored) {
            this.cachedFingerprint = stored;
            return stored;
        }

        // Generate new fingerprint
        if (!this.fpPromise) {
            this.fpPromise = FingerprintJS.load();
        }

        const fp = await this.fpPromise;
        const result = await fp.get();
        const fingerprint = result.visitorId;

        // Cache it
        this.cachedFingerprint = fingerprint;
        localStorage.setItem('deviceFingerprint', fingerprint);

        return fingerprint;
    }

    clearFingerprint() {
        this.cachedFingerprint = null;
        localStorage.removeItem('deviceFingerprint');
    }
}

export const deviceFingerprintService = new DeviceFingerprintService();
