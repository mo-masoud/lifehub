import { __ } from '@/lib/i18n';

export default function NoSnapshots() {
    return (
        <div className="overflow-hidden rounded-lg border bg-white dark:bg-zinc-950">
            <div className="border-b px-4 py-2">
                <h3 className="text-primary text-sm font-bold">{__('stats.no_snapshots')}</h3>
            </div>
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">{__('stats.create_first_snapshot')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
