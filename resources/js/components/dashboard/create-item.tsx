import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { __ } from '@/lib/i18n';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { FC, useState } from 'react';

export const CreateItem = ({ label, FormComponent }: { label: string; FormComponent: FC<any> }) => {
    const { dir } = usePage<SharedData>().props;

    const [show, setShow] = useState(false);

    return (
        <Sheet open={show} onOpenChange={setShow}>
            <SheetTrigger asChild>
                <Button onClick={() => setShow(true)}>
                    <span>{__('messages.new')}</span>
                    <PlusCircle />
                </Button>
            </SheetTrigger>
            <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()} side={dir === 'rtl' ? 'left' : 'right'}>
                <SheetHeader>
                    <SheetTitle>{label}</SheetTitle>
                    <SheetDescription className="sr-only"></SheetDescription>
                </SheetHeader>

                <FormComponent onSave={() => setShow(false)} />
            </SheetContent>
        </Sheet>
    );
};
