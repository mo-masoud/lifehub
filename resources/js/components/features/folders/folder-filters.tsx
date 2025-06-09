import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Star } from 'lucide-react';

interface FolderFiltersProps {
    featured: 'all' | 'featured' | 'not_featured';
    setFeatured: (featured: 'all' | 'featured' | 'not_featured') => void;
}

export function FolderFilters({ featured, setFeatured }: FolderFiltersProps) {
    const handleFeaturedChange = (value: string) => {
        setFeatured(value as 'all' | 'featured' | 'not_featured');
    };

    return (
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Star />
                        <span className="sr-only">Filter by featured status</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Filter by featured status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={featured} onValueChange={handleFeaturedChange}>
                        <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="featured">Featured</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="not_featured">Not featured</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
