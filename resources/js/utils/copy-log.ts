import axios from 'axios';

export interface CopyLogData {
    copyable_type: 'password' | 'ssh';
    copyable_id: number;
    field: string;
}

/**
 * Log a copy action to the backend API
 */
export const logCopy = async (data: CopyLogData): Promise<void> => {
    try {
        await axios.post(route('api.dashboard.copy-logs.store'), data);
    } catch (error) {
        // Silently fail copy logging - don't interfere with user experience
        console.warn('Failed to log copy action:', error);
    }
};

/**
 * Copy text to clipboard and log the action
 */
export const copyToClipboardWithLogging = async (
    text: string,
    copyable_type: 'password' | 'ssh',
    copyable_id: number,
    field: string,
    onSuccess?: () => void,
    onError?: (error: any) => void
): Promise<void> => {
    try {
        // Copy to clipboard first
        await navigator.clipboard.writeText(text);

        // Log the copy action (non-blocking)
        logCopy({
            copyable_type,
            copyable_id,
            field
        });

        // Call success callback
        onSuccess?.();
    } catch (error) {
        // Call error callback
        onError?.(error);
    }
};
