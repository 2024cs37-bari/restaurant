import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Users, Phone, Calendar, CalendarClock } from "lucide-react";
import NoRecordsFound from '@/components/no-records-found';
import { formatDateTime } from '@/utils/helpers';
import { reservationBucket } from '../../utils/reservationBucket.mjs';
import ReservationDialog from './ReservationDialog';
import { Reservation, ReservationsIndexProps } from './types';

const STATUS_STYLE: Record<string, string> = {
    booked: 'bg-blue-100 text-blue-700',
    seated: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-slate-100 text-slate-500',
    no_show: 'bg-red-100 text-red-700',
};

const GROUPS: { key: string; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
];

export default function Index() {
    const { t } = useTranslation();
    const { reservations, tables, auth } = usePage<ReservationsIndexProps>().props;
    const perms = auth.user?.permissions ?? [];
    const can = (p: string) => perms.includes(p);

    const [dialog, setDialog] = useState<{ open: boolean; data: Reservation | null }>({ open: false, data: null });
    const del = useDeleteHandler({ routeName: 'restaurant.reservations.destroy', defaultMessage: t('Delete this reservation?') });

    const act = (name: string, id: number) => router.post(route(name, id), {}, { preserveScroll: true });

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Reservations') }]}
            pageTitle={t('Reservations')}
            pageActions={can('create-reservations') ? (
                <Button size="sm" onClick={() => setDialog({ open: true, data: null })}><Plus className="h-4 w-4 mr-1" />{t('New Reservation')}</Button>
            ) : null}
        >
            <Head title={t('Reservations')} />

            {reservations.length === 0 ? (
                <Card><CardContent className="p-0">
                    <NoRecordsFound icon={CalendarClock} title={t('No reservations yet')} description={t('Book a table for a customer to get started.')}
                        createPermission="create-reservations" onCreateClick={() => setDialog({ open: true, data: null })} createButtonText={t('New Reservation')} className="h-auto" />
                </CardContent></Card>
            ) : (
                <div className="space-y-6">
                    {GROUPS.map((group) => {
                        const items = reservations.filter((r) => reservationBucket(r.reserved_at) === group.key);
                        if (items.length === 0) return null;
                        return (
                            <div key={group.key}>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2">{t(group.label)} <span className="text-gray-400">({items.length})</span></h3>
                                <Card><CardContent className="p-0 divide-y">
                                    {items.map((r) => (
                                        <div key={r.id} className="flex items-center gap-3 p-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">{r.customer_name}</span>
                                                    <Badge className={STATUS_STYLE[r.status]}>{t(r.status === 'no_show' ? 'No-show' : r.status.charAt(0).toUpperCase() + r.status.slice(1))}</Badge>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                                                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDateTime(r.reserved_at)}</span>
                                                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{r.party_size}</span>
                                                    {r.table?.name && <span className="text-gray-400">· {r.table.name}</span>}
                                                    {r.customer_phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" />{r.customer_phone}</span>}
                                                </div>
                                            </div>
                                            {can('edit-reservations') && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {r.status === 'booked' && <DropdownMenuItem onClick={() => act('restaurant.reservations.seat', r.id)}>{t('Seat')}</DropdownMenuItem>}
                                                        {r.status === 'booked' && <DropdownMenuItem onClick={() => act('restaurant.reservations.no-show', r.id)}>{t('No-show')}</DropdownMenuItem>}
                                                        {r.status !== 'cancelled' && <DropdownMenuItem onClick={() => act('restaurant.reservations.cancel', r.id)}>{t('Cancel')}</DropdownMenuItem>}
                                                        <DropdownMenuItem onClick={() => setDialog({ open: true, data: r })}>{t('Edit')}</DropdownMenuItem>
                                                        {can('delete-reservations') && <DropdownMenuItem onClick={() => del.openDeleteDialog(r.id)} className="text-red-600">{t('Delete')}</DropdownMenuItem>}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </div>
                                    ))}
                                </CardContent></Card>
                            </div>
                        );
                    })}
                </div>
            )}

            <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ open, data: open ? dialog.data : null })}>
                {dialog.open && <ReservationDialog reservation={dialog.data} tables={tables} onSuccess={() => setDialog({ open: false, data: null })} />}
            </Dialog>

            <ConfirmationDialog open={del.deleteState.isOpen} onOpenChange={del.closeDeleteDialog} title={t('Delete Reservation')} message={del.deleteState.message} confirmText={t('Delete')} onConfirm={del.confirmDelete} variant="destructive" />
        </AuthenticatedLayout>
    );
}
