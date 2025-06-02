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

export const NotificationsNav = () => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <span className="bg-destructive absolute top-0 right-0 inline-flex size-4 items-center justify-center rounded-full p-1 text-xs font-semibold text-white">
                        3
                    </span>
                    <Bell className="animate-wiggle" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 p-1" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <h3>Notifications</h3>
                    <Button size="icon" variant="ghost" className="text-green-700 hover:text-green-500" title="Mark all as read">
                        <CheckCheck />
                    </Button>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-orange-50 dark:hover:bg-orange-950/30">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/50">
                        <Shield className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Security Alert</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Google password will expire soon</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex cursor-pointer items-center gap-3 p-3 transition-colors hover:bg-green-50 dark:hover:bg-green-950/30">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Goal Achieved!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Congratulations on reaching your milestone</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
