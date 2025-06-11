import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Clock, Shield, ShieldAlert, User } from 'lucide-react';
import { useRef, useState } from 'react';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    icon_type: string;
    read_at: string | null;
    created_at: string;
    password?: any;
}

interface NotificationsData {
    latest: Notification[];
    unread_count: number;
}

export function NotificationsNav() {
    const { notifications } = usePage<{ notifications: NotificationsData }>().props;
    const [isMarkingAsRead, setIsMarkingAsRead] = useState<string | null>(null);
    const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const getNotificationIcon = (iconType: string) => {
        switch (iconType) {
            case 'password_expired':
                return <ShieldAlert className="size-4 text-red-600" />;
            case 'password_expiring':
                return <Shield className="size-4 text-amber-600" />;
            case 'welcome':
                return <User className="size-4 text-blue-600" />;
            default:
                return <Bell className="size-4 text-gray-600" />;
        }
    };

    const getNotificationIconBg = (iconType: string) => {
        switch (iconType) {
            case 'password_expired':
                return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
            case 'password_expiring':
                return 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800';
            case 'welcome':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800';
        }
    };

    const handleNotificationHover = (notificationId: string) => {
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        // Set timeout for 1000ms
        hoverTimeoutRef.current = setTimeout(() => {
            markAsRead(notificationId);
        }, 1000);
    };

    const handleNotificationLeave = () => {
        // Clear timeout if user stops hovering
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    const markAsRead = async (notificationId: string) => {
        if (isMarkingAsRead || !notifications.latest.find((n) => n.id === notificationId && !n.read_at)) {
            return;
        }

        setIsMarkingAsRead(notificationId);
        try {
            await axios.post(`/api/v1/notifications/${notificationId}/mark-read`);
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        } finally {
            setIsMarkingAsRead(null);
        }
    };

    const markAllAsRead = async () => {
        if (isMarkingAllAsRead || notifications.unread_count === 0) {
            return;
        }

        setIsMarkingAllAsRead(true);
        try {
            await axios.post('/api/v1/notifications/mark-all-read');
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            setIsMarkingAllAsRead(false);
        }
    };

    if (!notifications) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    {notifications.unread_count > 0 && (
                        <span className="bg-destructive absolute top-0 right-0 inline-flex size-4 items-center justify-center rounded-full p-1 text-[11px] font-semibold text-neutral-50">
                            {notifications.unread_count}
                        </span>
                    )}
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 p-1" align="end">
                <DropdownMenuLabel className="flex items-center justify-between py-0 pr-0">
                    Notifications
                    <Button
                        size="icon"
                        variant="ghost"
                        title="Mark all as read"
                        onClick={markAllAsRead}
                        disabled={isMarkingAllAsRead || notifications.unread_count === 0}
                    >
                        <CheckCheck className={isMarkingAllAsRead ? 'animate-spin' : ''} />
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {notifications.latest.length === 0 ? (
                    <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">No notifications</div>
                ) : (
                    <>
                        {notifications.latest.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className="flex min-h-16 cursor-pointer items-start gap-3 p-3"
                                onMouseEnter={() => handleNotificationHover(notification.id)}
                                onMouseLeave={handleNotificationLeave}
                            >
                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${getNotificationIconBg(notification.icon_type)}`}
                                >
                                    {getNotificationIcon(notification.icon_type)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</p>
                                    <p className="mt-1 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">{notification.message}</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Clock className="size-3 text-gray-400" />
                                        <span className="text-xs text-gray-400">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                                {!notification.read_at && <div className="bg-primary mt-1 size-2 shrink-0 rounded-full"></div>}
                            </DropdownMenuItem>
                        ))}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full cursor-not-allowed justify-center text-sm opacity-50" disabled>
                                View all notifications (Coming soon)
                            </Button>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
