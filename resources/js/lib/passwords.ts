/**
 * Generate a very strong password with near 100% strength
 * @param length - Password length (minimum 12, default 16)
 * @returns Strong password string
 */
export const generateRandomPassword = (length: number = 16): string => {
    // Ensure minimum length for strong passwords
    const len = Math.max(length, 12);

    // Character sets
    const uppercase = 'ABCDEFGHIJKLMNPQRSTUVWXYZ'; // Removed O for clarity
    const lowercase = 'abcdefghijkmnpqrstuvwxyz'; // Removed l for clarity
    const numbers = '23456789'; // Removed 0,1 for clarity
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = uppercase + lowercase + numbers + symbols;

    // Start with one character from each set to guarantee variety
    let password = '';
    password += getRandomChar(uppercase);
    password += getRandomChar(lowercase);
    password += getRandomChar(numbers);
    password += getRandomChar(symbols);

    // Fill remaining length with random characters from all sets
    for (let i = 4; i < len; i++) {
        password += getRandomChar(allChars);
    }

    // Shuffle the password to avoid predictable patterns
    return shuffleString(password);
};

/**
 * Get a cryptographically secure random character from a string
 */
const getRandomChar = (chars: string): string => {
    if (typeof window !== 'undefined' && window.crypto) {
        // Browser environment
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return chars[array[0] % chars.length];
    } else {
        // Fallback (less secure)
        return chars[Math.floor(Math.random() * chars.length)];
    }
};

/**
 * Shuffle string characters using Fisher-Yates algorithm
 */
const shuffleString = (str: string): string => {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
};
