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
import { Plus, Edit as EditIcon, Trash2, SlidersHorizontal } from "lucide-react";
import NoRecordsFound from '@/components/no-records-found';
import { formatCurrency } from '@/utils/helpers';
import GroupDialog from './GroupDialog';
import { ModifierGroup, ModifierGroupsIndexProps } from './types';

export default function Index() {
    const { t } = useTranslation();
    const { groups, auth } = usePage<ModifierGroupsIndexProps>().props;
    const perms = auth.user?.permissions ?? [];
    const can = (p: string) => perms.includes(p);

    const [dialog, setDialog] = useState<{ open: boolean; data: ModifierGroup | null }>({ open: false, data: null });
    const del = useDeleteHandler({ routeName: 'restaurant.modifier-groups.destroy', defaultMessage: t('Delete this modifier group?') });

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Modifiers') }]}
            pageTitle={t('Modifier Groups')}
            pageActions={can('create-modifier-groups') ? (
                <Button size="sm" onClick={() => setDialog({ open: true, data: null })}><Plus className="h-4 w-4 mr-1" />{t('Add Group')}</Button>
            ) : null}
        >
            <Head title={t('Modifier Groups')} />

            {groups.length === 0 ? (
                <Card><CardContent className="p-0">
                    <NoRecordsFound
                        icon={SlidersHorizontal}
                        title={t('No modifier groups yet')}
                        description={t('Create reusable add-on groups (e.g. Sauces, Extras) to attach to menu items.')}
                        createPermission="create-modifier-groups"
                        onCreateClick={() => setDialog({ open: true, data: null })}
                        createButtonText={t('Add Group')}
                        className="h-auto"
                    />
                </CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {groups.map((group) => (
                        <Card key={group.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-semibold">{group.name}</h3>
                                        <div className="flex gap-1 mt-1">
                                            <Badge variant="secondary">{group.is_required ? t('Required') : t('Optional')}</Badge>
                                            <Badge variant="secondary">{t('min')} {group.min_select}{group.max_select ? ` · ${t('max')} ${group.max_select}` : ''}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {can('edit-modifier-groups') && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600" onClick={() => setDialog({ open: true, data: group })}><EditIcon className="h-4 w-4" /></Button>}
                                        {can('delete-modifier-groups') && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => del.openDeleteDialog(group.id)}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>
                                </div>
                                <div className="divide-y border-t">
                                    {group.options.length === 0 && <p className="text-xs text-gray-400 py-2">{t('No options.')}</p>}
                                    {group.options.map((o, i) => (
                                        <div key={i} className="flex justify-between py-1.5 text-sm">
                                            <span className="text-gray-700">{o.name}</span>
                                            <span className="text-gray-500">{Number(o.price) > 0 ? `+${formatCurrency(Number(o.price))}` : formatCurrency(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ open, data: open ? dialog.data : null })}>
                {dialog.open && <GroupDialog group={dialog.data} onSuccess={() => setDialog({ open: false, data: null })} />}
            </Dialog>

            <ConfirmationDialog
                open={del.deleteState.isOpen}
                onOpenChange={del.closeDeleteDialog}
                title={t('Delete Modifier Group')}
                message={del.deleteState.message}
                confirmText={t('Delete')}
                onConfirm={del.confirmDelete}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
