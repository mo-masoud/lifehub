import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useViewPassword } from '@/contexts';
import { useNotifications } from '@/contexts/shared/notifications-context';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { Bell, CheckCheck, Clock, KeyRound, Loader2, Shield, ShieldAlert, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

interface PaginatedNotifications {
    data: Notification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export function NotificationsSheet() {
    const { isOpen, closeSheet } = useNotifications();
    const [paginatedNotifications, setPaginatedNotifications] = useState<PaginatedNotifications | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isMarkingAsRead, setIsMarkingAsRead] = useState<string | null>(null);
    const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const { openSheet: openPasswordsSheet } = useViewPassword();

    const getNotificationIcon = (iconType: string) => {
        switch (iconType) {
            case 'password_expired':
                return <ShieldAlert className="size-5 text-red-600" />;
            case 'password_expiring':
                return <Shield className="size-5 text-amber-600" />;
            case 'welcome':
                return <User className="size-5 text-blue-600" />;
            default:
                return <Bell className="size-5 text-slate-600" />;
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

    const loadNotifications = async (page = 1, append = false) => {
        if (page === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const [notificationsResponse, countResponse] = await Promise.all([
                axios.get(`/api/v1/notifications/paginated?page=${page}&per_page=10`),
                page === 1 ? axios.get('/api/v1/notifications/unread-count') : Promise.resolve(null),
            ]);

            const data = notificationsResponse.data.data;

            if (append && paginatedNotifications) {
                setPaginatedNotifications({
                    ...data,
                    data: [...paginatedNotifications.data, ...data.data],
                });
            } else {
                setPaginatedNotifications(data);
            }

            // Update unread count on first load
            if (page === 1 && countResponse) {
                setUnreadCount(countResponse.data.data.count);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleNotificationHover = (notificationId: string) => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        hoverTimeoutRef.current = setTimeout(() => {
            markAsRead(notificationId);
        }, 1000);
    };

    const handleNotificationLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
    };

    const markAsRead = async (notificationId: string) => {
        if (isMarkingAsRead) return;

        const notification = paginatedNotifications?.data.find((n) => n.id === notificationId && !n.read_at);
        if (!notification) return;

        setIsMarkingAsRead(notificationId);
        try {
            await axios.post(`/api/v1/notifications/${notificationId}/mark-read`);

            // Update local state
            if (paginatedNotifications) {
                setPaginatedNotifications({
                    ...paginatedNotifications,
                    data: paginatedNotifications.data.map((n) => (n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)),
                });
            }

            // Update local unread count
            setUnreadCount((prev) => Math.max(0, prev - 1));

            // Reload the main notifications data for the nav badge
            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        } finally {
            setIsMarkingAsRead(null);
        }
    };

    const markAllAsRead = async () => {
        if (isMarkingAllAsRead || unreadCount === 0) return;

        setIsMarkingAllAsRead(true);
        try {
            await axios.post('/api/v1/notifications/mark-all-read');

            // Update local state
            if (paginatedNotifications) {
                setPaginatedNotifications({
                    ...paginatedNotifications,
                    data: paginatedNotifications.data.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })),
                });
            }

            // Reset local unread count
            setUnreadCount(0);

            router.reload({ only: ['notifications'] });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        } finally {
            setIsMarkingAllAsRead(false);
        }
    };

    const handlePasswordAction = (password: any) => {
        // Navigate to passwords page - the highlight feature can be added later
        if (password) {
            openPasswordsSheet(password);
            closeSheet();
        }
    };

    const loadMore = () => {
        if (paginatedNotifications && paginatedNotifications.current_page < paginatedNotifications.last_page) {
            loadNotifications(paginatedNotifications.current_page + 1, true);
        }
    };

    // Load notifications when sheet opens
    useEffect(() => {
        if (isOpen) {
            loadNotifications();
        }
    }, [isOpen]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    // The sheet can always render - it will fetch data when opened
    // No need for early return check

    return (
        <Sheet open={isOpen} onOpenChange={closeSheet}>
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Bell className="size-5" />
                            Notifications
                        </span>
                    </SheetTitle>
                    <SheetDescription>Stay updated with your password security and account activities.</SheetDescription>
                </SheetHeader>

                {unreadCount > 0 && (
                    <div className="inline-flex items-center justify-end px-4">
                        <Button size="sm" variant="outline" onClick={markAllAsRead} disabled={isMarkingAllAsRead} className="text-sm">
                            {isMarkingAllAsRead ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
                            Mark all read
                        </Button>
                    </div>
                )}
                <div className="mb-6 space-y-1 px-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="text-muted-foreground size-6 animate-spin" />
                        </div>
                    ) : !paginatedNotifications || paginatedNotifications.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Bell className="text-muted-foreground mx-auto mb-4 size-12" />
                            <p className="text-muted-foreground text-sm">No notifications yet</p>
                            <p className="text-muted-foreground mt-1 text-xs">You'll see important updates about your passwords here</p>
                        </div>
                    ) : (
                        <>
                            {paginatedNotifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
                                    onMouseEnter={() => handleNotificationHover(notification.id)}
                                    onMouseLeave={handleNotificationLeave}
                                >
                                    <div className="shrink-0">{getNotificationIcon(notification.icon_type)}</div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        <div>
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-foreground text-sm font-medium">{notification.title}</h4>
                                                {!notification.read_at && <div className="bg-primary mt-1 size-2 shrink-0 rounded-full"></div>}
                                            </div>
                                            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{notification.message}</p>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                                <Clock className="size-3" />
                                                <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                                            </div>

                                            {/* Action buttons for password notifications */}
                                            {notification.password && (
                                                <Button size="icon" variant="outline" onClick={() => handlePasswordAction(notification.password)}>
                                                    <KeyRound />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Load More Button */}
                            {paginatedNotifications.current_page < paginatedNotifications.last_page && (
                                <div className="pt-4">
                                    <Button variant="outline" onClick={loadMore} disabled={isLoadingMore} className="w-full">
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 size-4 animate-spin" />
                                                Loading more...
                                            </>
                                        ) : (
                                            'Load more'
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Pagination info */}
                            {paginatedNotifications.total > 0 && (
                                <div className="text-muted-foreground mt-4 border-t pt-4 text-center text-xs">
                                    Showing {paginatedNotifications.data.length} of {paginatedNotifications.total} notifications
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
