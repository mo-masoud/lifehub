import { Password } from '@/types/passwords';
import axios from 'axios';
import { toast } from 'sonner';

export const usePasswords = () => {
    const handleCopy = (key: string, password: Password) => {
        axios
            .post(route('passwords.copy', password.id))
            .then(() => {
                navigator.clipboard.writeText(`${password[key as keyof Password]}`);
                toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} copied to clipboard`);
            })
            .catch((e) => {
                console.error(e);
                toast.error('Failed to copy password');
            });
    };

    return {
        handleCopy,
    };
};
