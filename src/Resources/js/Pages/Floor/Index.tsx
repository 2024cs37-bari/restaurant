import { useRef, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit as EditIcon, Trash2, LayoutGrid, Map, GitMerge, X, UtensilsCrossed } from "lucide-react";
import NoRecordsFound from '@/components/no-records-found';
import TableTile from './TableTile';
import AreaDialog from './AreaDialog';
import TableDialog from './TableDialog';
import WaiterDialog from './WaiterDialog';
import { Area, RestaurantTable, FloorIndexProps } from './types';

export default function Index() {
    const { t } = useTranslation();
    const { areas, waiters, auth } = usePage<FloorIndexProps>().props;
    const perms = auth.user?.permissions ?? [];
    const can = (p: string) => perms.includes(p);

    const [view, setView] = useState<'board' | 'plan'>('board');
    const [mergeMode, setMergeMode] = useState(false);
    const [selected, setSelected] = useState<number[]>([]);
    const [areaDialog, setAreaDialog] = useState<{ open: boolean; data: Area | null }>({ open: false, data: null });
    const [tableDialog, setTableDialog] = useState<{ open: boolean; data: RestaurantTable | null; areaId: number }>({ open: false, data: null, areaId: 0 });
    const [waiterDialog, setWaiterDialog] = useState<{ open: boolean; table: RestaurantTable | null }>({ open: false, table: null });
    const [posOverride, setPosOverride] = useState<Record<number, { x: number; y: number }>>({});

    const areaDelete = useDeleteHandler({ routeName: 'restaurant.areas.destroy', defaultMessage: t('Delete this area?') });
    const tableDelete = useDeleteHandler({ routeName: 'restaurant.tables.destroy', defaultMessage: t('Delete this table?') });

    const drag = useRef<{ id: number; startX: number; startY: number; origX: number; origY: number } | null>(null);

    const onTileAction = (action: string, table: RestaurantTable) => {
        const post = (name: string, data: any = {}) => router.post(route(name, table.id), data, { preserveScroll: true });
        switch (action) {
            case 'seat': return post('restaurant.tables.status', { status: 'seated' });
            case 'free': return post('restaurant.tables.status', { status: 'free' });
            case 'reserve': return post('restaurant.tables.status', { status: 'reserved' });
            case 'split': return post('restaurant.tables.split');
            case 'waiter': return setWaiterDialog({ open: true, table });
            case 'edit': return setTableDialog({ open: true, data: table, areaId: table.area_id });
            case 'delete': return tableDelete.openDeleteDialog(table.id);
        }
    };

    const toggleSelect = (table: RestaurantTable) => {
        setSelected((prev) => prev.includes(table.id) ? prev.filter((x) => x !== table.id) : [...prev, table.id]);
    };

    const doMerge = () => {
        if (selected.length < 2) return;
        router.post(route('restaurant.tables.merge'), { primary_id: selected[0], table_ids: selected }, {
            preserveScroll: true,
            onSuccess: () => { setSelected([]); setMergeMode(false); },
        });
    };

    // Floor-plan drag
    const startDrag = (e: React.MouseEvent, table: RestaurantTable) => {
        const pos = posOverride[table.id] ?? { x: table.pos_x, y: table.pos_y };
        drag.current = { id: table.id, startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', endDrag);
    };
    const onDragMove = (e: MouseEvent) => {
        const d = drag.current;
        if (!d) return;
        const x = Math.max(0, d.origX + (e.clientX - d.startX));
        const y = Math.max(0, d.origY + (e.clientY - d.startY));
        setPosOverride((prev) => ({ ...prev, [d.id]: { x, y } }));
    };
    const endDrag = () => {
        const d = drag.current;
        window.removeEventListener('mousemove', onDragMove);
        window.removeEventListener('mouseup', endDrag);
        drag.current = null;
        if (!d) return;
        const pos = posOverride[d.id];
        if (pos) router.post(route('restaurant.tables.position', d.id), { pos_x: Math.round(pos.x), pos_y: Math.round(pos.y) }, { preserveScroll: true });
    };

    const tileProps = (table: RestaurantTable) => ({
        table, canEdit: can('edit-tables'), canDelete: can('delete-tables'),
        mergeMode, selected: selected.includes(table.id),
        onSelect: toggleSelect, onAction: onTileAction,
    });

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Floor') }]}
            pageTitle={t('Floor')}
            pageActions={
                <div className="flex items-center gap-2">
                    <div className="flex rounded-md border overflow-hidden">
                        <button className={`px-2 py-1 ${view === 'board' ? 'bg-muted' : ''}`} onClick={() => setView('board')} title={t('Board')}><LayoutGrid className="h-4 w-4" /></button>
                        <button className={`px-2 py-1 ${view === 'plan' ? 'bg-muted' : ''}`} onClick={() => setView('plan')} title={t('Floor plan')}><Map className="h-4 w-4" /></button>
                    </div>
                    {can('edit-tables') && (
                        mergeMode ? (
                            <>
                                <Button size="sm" onClick={doMerge} disabled={selected.length < 2}><GitMerge className="h-4 w-4 mr-1" />{t('Merge')} ({selected.length})</Button>
                                <Button size="sm" variant="outline" onClick={() => { setMergeMode(false); setSelected([]); }}><X className="h-4 w-4" /></Button>
                            </>
                        ) : (
                            <Button size="sm" variant="outline" onClick={() => setMergeMode(true)}><GitMerge className="h-4 w-4 mr-1" />{t('Merge')}</Button>
                        )
                    )}
                    {can('create-tables') && <Button size="sm" variant="outline" onClick={() => setAreaDialog({ open: true, data: null })}><Plus className="h-4 w-4 mr-1" />{t('Area')}</Button>}
                </div>
            }
        >
            <Head title={t('Floor')} />

            {areas.length === 0 ? (
                <Card><CardContent className="p-0">
                    <NoRecordsFound icon={UtensilsCrossed} title={t('No areas yet')} description={t('Create an area (e.g. Indoor), then add tables to it.')}
                        createPermission="create-tables" onCreateClick={() => setAreaDialog({ open: true, data: null })} createButtonText={t('Add Area')} className="h-auto" />
                </CardContent></Card>
            ) : (
                <div className="space-y-6">
                    {areas.map((area) => (
                        <Card key={area.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold">{area.name}</h3>
                                        {!area.is_active && <span className="text-xs text-gray-400">({t('Inactive')})</span>}
                                        <span className="text-xs text-gray-400">· {area.tables?.length ?? 0} {t('tables')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {can('create-tables') && <Button size="sm" variant="outline" onClick={() => setTableDialog({ open: true, data: null, areaId: area.id })}><Plus className="h-3 w-3 mr-1" />{t('Table')}</Button>}
                                        {can('edit-tables') && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600" onClick={() => setAreaDialog({ open: true, data: area })}><EditIcon className="h-4 w-4" /></Button>}
                                        {can('delete-tables') && <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => areaDelete.openDeleteDialog(area.id)}><Trash2 className="h-4 w-4" /></Button>}
                                    </div>
                                </div>

                                {(area.tables?.length ?? 0) === 0 ? (
                                    <p className="text-sm text-gray-400 py-4 text-center">{t('No tables in this area yet.')}</p>
                                ) : view === 'board' ? (
                                    <div className="flex flex-wrap gap-3">
                                        {area.tables!.map((table) => <TableTile key={table.id} {...tileProps(table)} />)}
                                    </div>
                                ) : (
                                    <div className="relative border rounded-lg bg-gray-50 min-h-[360px] overflow-hidden">
                                        {area.tables!.map((table) => {
                                            const pos = posOverride[table.id] ?? { x: table.pos_x, y: table.pos_y };
                                            return <TableTile key={table.id} {...tileProps(table)} draggable
                                                onDragStart={startDrag}
                                                style={{ position: 'absolute', left: pos.x, top: pos.y }} />;
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={areaDialog.open} onOpenChange={(open) => setAreaDialog({ open, data: open ? areaDialog.data : null })}>
                {areaDialog.open && <AreaDialog area={areaDialog.data} onSuccess={() => setAreaDialog({ open: false, data: null })} />}
            </Dialog>
            <Dialog open={tableDialog.open} onOpenChange={(open) => setTableDialog({ ...tableDialog, open, data: open ? tableDialog.data : null })}>
                {tableDialog.open && <TableDialog table={tableDialog.data} areaId={tableDialog.areaId} areas={areas} waiters={waiters} onSuccess={() => setTableDialog({ open: false, data: null, areaId: 0 })} />}
            </Dialog>
            <Dialog open={waiterDialog.open} onOpenChange={(open) => setWaiterDialog({ open, table: open ? waiterDialog.table : null })}>
                {waiterDialog.open && waiterDialog.table && <WaiterDialog table={waiterDialog.table} waiters={waiters} onSuccess={() => setWaiterDialog({ open: false, table: null })} />}
            </Dialog>

            <ConfirmationDialog open={areaDelete.deleteState.isOpen} onOpenChange={areaDelete.closeDeleteDialog} title={t('Delete Area')} message={areaDelete.deleteState.message} confirmText={t('Delete')} onConfirm={areaDelete.confirmDelete} variant="destructive" />
            <ConfirmationDialog open={tableDelete.deleteState.isOpen} onOpenChange={tableDelete.closeDeleteDialog} title={t('Delete Table')} message={tableDelete.deleteState.message} confirmText={t('Delete')} onConfirm={tableDelete.confirmDelete} variant="destructive" />
        </AuthenticatedLayout>
    );
}
