import { Braces, ClipboardType, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export const SharePassword = () => {
    const [open, setOpen] = useState(false);
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Share2 />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" autoFocus={open}>
                <DropdownMenuItem className="cursor-pointer">
                    <Braces />
                    JSON
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000" className="size-4">
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <g>
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path
                                    fillRule="nonzero"
                                    d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h16V5H4zm3 10.5H5v-7h2l2 2 2-2h2v7h-2v-4l-2 2-2-2v4zm11-3h2l-3 3-3-3h2v-4h2v4z"
                                ></path>
                            </g>
                        </g>
                    </svg>
                    Markdown
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                    <ClipboardType />
                    Text
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
