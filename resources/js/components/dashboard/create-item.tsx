import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { __ } from '@/lib/i18n';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { FC, useState } from 'react';

interface CreateItemProps {
    label: string;
    FormComponent: FC<any>;
    trigger?: React.ReactNode;
}

export const CreateItem = ({ label, FormComponent, trigger }: CreateItemProps) => {
    const { dir } = usePage<SharedData>().props;

    const [show, setShow] = useState(false);

    return (
        <Sheet open={show} onOpenChange={setShow}>
            <SheetTrigger asChild onClick={() => setShow(true)}>
                {trigger ? (
                    trigger
                ) : (
                    <Button>
                        <span>{__('messages.new')}</span>
                        <PlusCircle />
                    </Button>
                )}
            </SheetTrigger>
            <SheetContent onOpenAutoFocus={(e) => e.preventDefault()} side={dir === 'rtl' ? 'left' : 'right'}>
                <SheetHeader>
                    <SheetTitle>{label}</SheetTitle>
                    <SheetDescription className="sr-only"></SheetDescription>
                </SheetHeader>

                <FormComponent onSave={() => setShow(false)} />
            </SheetContent>
        </Sheet>
    );
};
