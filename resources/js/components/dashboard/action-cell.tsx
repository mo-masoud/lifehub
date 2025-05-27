import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TableCell } from '@/components/ui/table';
import { __ } from '@/lib/i18n';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { FilePenLine, Trash2 } from 'lucide-react';
import { FC, useState } from 'react';

interface Props {
    canEdit?: boolean;
    canDelete?: boolean;
    updateLabel?: string;
    FormComponent?: FC<any>;
    item: any;
    onDestroy?: (id: string) => void;
    asChild?: boolean;
    type?: 'modal' | 'sheet';
}
export const ActionCell = ({
    canEdit = true,
    canDelete = true,
    updateLabel = __('messages.update'),
    FormComponent,
    item,
    onDestroy,
    asChild,
    type = 'modal',
}: Props) => {
    const { dir } = usePage<SharedData>().props;

    const [show, setShow] = useState(false);

    const Container = asChild ? 'span' : TableCell;

    const nested = Object.values(item)[0];
    const record: Record<string, any> = nested ? { ...nested } : {};

    const editTrigger = (
        <Button variant="ghost" size="icon" onClick={() => setShow(true)}>
            <FilePenLine className="size-4 text-green-500" />
        </Button>
    );

    const renderEditForm = () => {
        if (!FormComponent) return null;

        if (type === 'modal') {
            return (
                <Dialog open={show} onOpenChange={setShow}>
                    <DialogTrigger asChild>{editTrigger}</DialogTrigger>
                    <DialogContent className="max-w-2xl" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <DialogHeader>
                            <DialogTitle>{updateLabel}</DialogTitle>
                            <DialogDescription className="sr-only"></DialogDescription>
                        </DialogHeader>

                        <FormComponent {...item} onSave={() => setShow(false)} />
                    </DialogContent>
                </Dialog>
            );
        }

        return (
            <Sheet open={show} onOpenChange={setShow}>
                <SheetTrigger asChild>{editTrigger}</SheetTrigger>
                <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()} side={dir === 'rtl' ? 'left' : 'right'}>
                    <SheetHeader>
                        <SheetTitle>{updateLabel}</SheetTitle>
                        <SheetDescription className="sr-only"></SheetDescription>
                    </SheetHeader>

                    <FormComponent {...item} onSave={() => setShow(false)} />
                </SheetContent>
            </Sheet>
        );
    };

    return (
        <Container className="flex items-center justify-end text-sm">
            {canEdit && FormComponent && renderEditForm()}
            {canDelete && onDestroy && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="text-destructive size-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{__('messages.delete_confirmation')}</AlertDialogTitle>
                            <AlertDialogDescription>{__('messages.caution_cant_undone')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{__('messages.cancel')}</AlertDialogCancel>
                            <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={() => onDestroy(record.id)}>
                                {__('messages.delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Container>
    );
};
