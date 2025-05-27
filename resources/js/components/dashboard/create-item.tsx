import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { __ } from '@/lib/i18n';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import { FC, useState } from 'react';

interface CreateItemProps {
    label: string;
    type?: 'modal' | 'sheet';
    FormComponent: FC<any>;
    trigger?: React.ReactNode;
    formProps?: Record<string, any>;
}

export const CreateItem = ({ label, type = 'modal', FormComponent, trigger, formProps = {} }: CreateItemProps) => {
    const { dir } = usePage<SharedData>().props;

    const [show, setShow] = useState(false);

    const defaultTrigger = (
        <Button>
            <span>{__('messages.new')}</span>
            <PlusCircle />
        </Button>
    );

    if (type === 'modal') {
        return (
            <Dialog open={show} onOpenChange={setShow}>
                <DialogTrigger asChild onClick={() => setShow(true)}>
                    {trigger || defaultTrigger}
                </DialogTrigger>
                <DialogContent className="max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{label}</DialogTitle>
                        <DialogDescription className="sr-only"></DialogDescription>
                    </DialogHeader>

                    <FormComponent onSave={() => setShow(false)} {...formProps} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Sheet open={show} onOpenChange={setShow}>
            <SheetTrigger asChild onClick={() => setShow(true)}>
                {trigger || defaultTrigger}
            </SheetTrigger>
            <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()} side={dir === 'rtl' ? 'left' : 'right'}>
                <SheetHeader>
                    <SheetTitle>{label}</SheetTitle>
                    <SheetDescription className="sr-only"></SheetDescription>
                </SheetHeader>

                <FormComponent onSave={() => setShow(false)} {...formProps} />
            </SheetContent>
        </Sheet>
    );
};
