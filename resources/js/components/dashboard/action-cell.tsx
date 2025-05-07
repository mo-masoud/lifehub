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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { TableCell } from '@/components/ui/table';
import { __ } from '@/lib/i18n';
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
}
export const ActionCell = ({
    canEdit = true,
    canDelete = true,
    updateLabel = __('messages.update'),
    FormComponent,
    item,
    onDestroy,
    asChild,
}: Props) => {
    const [showUpdateSheet, setShowUpdateSheet] = useState(false);

    const Container = asChild ? 'span' : TableCell;

    return (
        <Container className="flex items-center justify-end text-sm">
            {canEdit && FormComponent && (
                <Sheet open={showUpdateSheet} onOpenChange={setShowUpdateSheet}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setShowUpdateSheet(true)}>
                            <FilePenLine className="size-4 text-green-500" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent className="min-w-[600px]" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <SheetHeader>
                            <SheetTitle>{updateLabel}</SheetTitle>
                            <SheetDescription className="sr-only"></SheetDescription>
                        </SheetHeader>

                        <FormComponent {...item} onSave={() => setShowUpdateSheet(false)} />
                    </SheetContent>
                </Sheet>
            )}
            {canDelete && onDestroy && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Trash2 className="size-4 text-red-500" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{__('messages.delete_confirmation')}</AlertDialogTitle>
                            <AlertDialogDescription>{__('messages.caution_cant_undone')}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>{__('messages.cancel')}</AlertDialogCancel>
                            <AlertDialogAction className={buttonVariants({ variant: 'destructive' })} onClick={() => onDestroy(item.id)}>
                                {__('messages.delete')}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </Container>
    );
};
