import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { __ } from '@/lib/i18n';
import { SharedData } from '@/types';
import { Password } from '@/types/models';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Clock, Eye, EyeOff, History } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PasswordHistoryItem {
    id: number;
    old_password: string;
    changed_at: string;
    changed_at_formatted: string;
}

interface PasswordHistoryResponse {
    data: PasswordHistoryItem[];
    message: string;
    password_name: string;
}

interface PasswordHistoryProps {
    password: Password;
}

export function PasswordHistory({ password }: PasswordHistoryProps) {
    const { dir } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<PasswordHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set());

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<PasswordHistoryResponse>(route('api.dashboard.passwords.history.index', { password: password.id }));
            setHistory(response.data.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || __('password_history.fetch_failed');
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [password.id]);

    useEffect(() => {
        if (isOpen && history.length === 0) {
            fetchHistory();
        }
    }, [isOpen, fetchHistory, history.length]);

    const togglePasswordVisibility = (historyId: number) => {
        const newVisible = new Set(visiblePasswords);
        if (newVisible.has(historyId)) {
            newVisible.delete(historyId);
        } else {
            newVisible.add(historyId);
        }
        setVisiblePasswords(newVisible);
    };

    const renderPasswordField = (historyItem: PasswordHistoryItem) => {
        const isVisible = visiblePasswords.has(historyItem.id);
        return (
            <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 rounded px-2 py-1 font-mono text-sm">{isVisible ? historyItem.old_password : '•'.repeat(12)}</code>
                <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility(historyItem.id)} className="h-8 w-8">
                    {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        );
    };

    const renderHistoryList = () => {
        if (loading) {
            return (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="shadow-none">
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-8 w-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <Card className="border-destructive shadow-none">
                    <CardContent className="p-4">
                        <p className="text-destructive text-sm">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchHistory} className="mt-2">
                            {__('messages.retry')}
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        if (history.length === 0) {
            return (
                <Card className="shadow-none">
                    <CardContent className="p-8 text-center">
                        <History className="text-muted-foreground mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-medium">{__('password_history.no_history')}</h3>
                        <p className="text-muted-foreground mt-2 text-sm">{__('password_history.description')}</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-4">
                {history.map((historyItem, index) => (
                    <Card key={historyItem.id} className="shadow-none">
                        <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                                <Clock className="text-muted-foreground h-4 w-4" />
                                <CardTitle className="text-sm font-medium">
                                    {__('password_history.previous_password')} #{history.length - index}
                                </CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                                {__('password_history.changed_at')}: {historyItem.changed_at_formatted}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                <label className="text-muted-foreground text-xs font-medium">{__('password_history.previous_password')}</label>
                                {renderPasswordField(historyItem)}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" title={__('password_history.view_history')}>
                    <History className="h-4 w-4 text-blue-500" />
                </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[600px] overflow-y-auto p-4" side={dir === 'rtl' ? 'left' : 'right'}>
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        {__('password_history.title')}
                    </SheetTitle>
                    <SheetDescription>
                        {__('password_history.description')} - <strong>{password.name}</strong>
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-2">{renderHistoryList()}</div>
            </SheetContent>
        </Sheet>
    );
}
