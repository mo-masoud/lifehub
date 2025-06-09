import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, CheckCheck, Shield, Trophy } from 'lucide-react';

export function NotificationsNav() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <span className="bg-destructive absolute top-0 right-0 inline-flex size-4 items-center justify-center rounded-full p-1 text-[11px] font-semibold text-neutral-50">
                        3
                    </span>
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-1" align="end">
                <DropdownMenuLabel className="flex items-center justify-between py-0 pr-0">
                    Notifications
                    <Button size="icon" variant="ghost" title="Mark all as read">
                        <CheckCheck />
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex h-16 cursor-pointer items-center gap-3">
                    <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                        <Shield className="text-primary-foreground size-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Security Alert</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Google password will expire soon</p>
                    </div>
                    <div className="bg-primary/80 size-1.5 rounded-full"></div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex h-16 cursor-pointer items-center gap-3">
                    <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md border">
                        <Trophy className="text-primary-foreground size-4" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Goal Achieved!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Congratulations on reaching your milestone</p>
                    </div>
                    <div className="bg-primary/80 size-1.5 rounded-full"></div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
