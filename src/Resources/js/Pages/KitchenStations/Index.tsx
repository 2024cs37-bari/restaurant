import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit as EditIcon, Trash2, ChefHat } from "lucide-react";
import NoRecordsFound from '@/components/no-records-found';
import StationDialog from './StationDialog';
import { AuthContext } from '@/types/common';

interface Station { id: number; name: string; is_active: boolean; }
interface Props { stations: Station[]; auth: AuthContext; [key: string]: unknown; }

export default function Index() {
    const { t } = useTranslation();
    const { stations, auth } = usePage<Props>().props;
    const perms = auth.user?.permissions ?? [];
    const can = (p: string) => perms.includes(p);

    const [dialog, setDialog] = useState<{ open: boolean; data: Station | null }>({ open: false, data: null });
    const del = useDeleteHandler({ routeName: 'restaurant.kitchen-stations.destroy', defaultMessage: t('Delete this station?') });

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Kitchen Stations') }]}
            pageTitle={t('Kitchen Stations')}
            pageActions={can('create-kitchen') ? <Button size="sm" onClick={() => setDialog({ open: true, data: null })}><Plus className="h-4 w-4 mr-1" />{t('Add Station')}</Button> : null}
        >
            <Head title={t('Kitchen Stations')} />

            {stations.length === 0 ? (
                <Card><CardContent className="p-0">
                    <NoRecordsFound icon={ChefHat} title={t('No stations yet')} description={t('Create stations (Grill, Fry, Bar…) and assign menu items to route them on the kitchen display.')}
                        createPermission="create-kitchen" onCreateClick={() => setDialog({ open: true, data: null })} createButtonText={t('Add Station')} className="h-auto" />
                </CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 divide-y">
                    {stations.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-3">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{s.name}</span>
                                {!s.is_active && <Badge variant="secondary">{t('Inactive')}</Badge>}
                            </div>
                            <div className="flex gap-1">
                                {can('edit-kitchen') && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600" onClick={() => setDialog({ open: true, data: s })}><EditIcon className="h-4 w-4" /></Button>}
                                {can('delete-kitchen') && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => del.openDeleteDialog(s.id)}><Trash2 className="h-4 w-4" /></Button>}
                            </div>
                        </div>
                    ))}
                </CardContent></Card>
            )}

            <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ open, data: open ? dialog.data : null })}>
                {dialog.open && <StationDialog station={dialog.data} onSuccess={() => setDialog({ open: false, data: null })} />}
            </Dialog>

            <ConfirmationDialog open={del.deleteState.isOpen} onOpenChange={del.closeDeleteDialog} title={t('Delete Station')} message={del.deleteState.message} confirmText={t('Delete')} onConfirm={del.confirmDelete} variant="destructive" />
        </AuthenticatedLayout>
    );
}
