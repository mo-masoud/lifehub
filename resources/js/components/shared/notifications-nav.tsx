import { Button } from '@/components/ui/button';
import { useNotifications } from '@/contexts/shared/notifications-context';
import { usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';

interface NotificationsData {
    unread_count: number;
}

export function NotificationsNav() {
    const { notifications } = usePage<{ notifications: NotificationsData }>().props;
    const { openSheet } = useNotifications();

    if (!notifications) {
        return null;
    }

    return (
        <Button variant="ghost" size="icon" className="relative" onClick={openSheet}>
            {notifications.unread_count > 0 && (
                <span className="bg-destructive absolute top-0 right-0 inline-flex size-4 items-center justify-center rounded-full p-2 text-[10px] font-semibold text-neutral-50">
                    {notifications.unread_count > 9 ? '9+' : notifications.unread_count}
                </span>
            )}
            <Bell />
        </Button>
    );
}
