import { useViewPassword } from '@/contexts/view-password-context';
import { ViewPasswordSheet } from './view-password-sheet';

export function GlobalViewPasswordSheet() {
    const { password, isOpen, closeSheet } = useViewPassword();

    if (!password) {
        return null;
    }

    return <ViewPasswordSheet password={password} open={isOpen} setOpen={closeSheet} />;
}
