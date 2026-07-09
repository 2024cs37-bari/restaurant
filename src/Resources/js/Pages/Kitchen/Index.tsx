import { useEffect, useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Check, ChefHat, Clock } from "lucide-react";
import { formatTime } from '@/utils/helpers';
import { ticketStatus } from '../../utils/ticketStatus.mjs';
import { KitchenIndexProps, KitchenOrder, KitchenItem } from './types';

const TICKET_RING: Record<string, string> = {
    new: 'border-blue-300',
    preparing: 'border-amber-300',
    ready: 'border-green-400',
    done: 'border-gray-200',
};
const TYPE_LABEL: Record<string, string> = { dine_in: 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery' };

export default function Index() {
    const { t } = useTranslation();
    const { orders, stations, auth } = usePage<KitchenIndexProps>().props;
    const canEdit = (auth.user?.permissions ?? []).includes('edit-kitchen');

    const [station, setStation] = useState<number | 'all'>('all');

    // Live board: poll for updates every 10s.
    useEffect(() => {
        const id = setInterval(() => router.reload({ only: ['orders'] }), 10000);
        return () => clearInterval(id);
    }, []);

    const inStation = (item: KitchenItem) => station === 'all' || item.menu_item?.kitchen_station_id === station;
    const setStatus = (item: KitchenItem, status: string) => router.post(route('restaurant.kitchen.item-status', item.id), { status }, { preserveScroll: true, preserveState: true });
    const allReady = (order: KitchenOrder) => router.post(route('restaurant.kitchen.order-ready', order.id), {}, { preserveScroll: true, preserveState: true });

    const visibleOrders = orders
        .map((o) => ({ ...o, _items: (o.items ?? []).filter(inStation) }))
        .filter((o) => o._items.length > 0);

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Kitchen') }]}
            pageTitle={t('Kitchen Display')}
            pageActions={
                <div className="flex flex-wrap gap-1">
                    <button onClick={() => setStation('all')} className={`px-3 py-1.5 rounded text-sm ${station === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{t('All')}</button>
                    {stations.map((s) => (
                        <button key={s.id} onClick={() => setStation(s.id)} className={`px-3 py-1.5 rounded text-sm ${station === s.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{s.name}</button>
                    ))}
                </div>
            }
        >
            <Head title={t('Kitchen')} />

            {visibleOrders.length === 0 ? (
                <Card><CardContent className="p-12 text-center text-gray-400">
                    <ChefHat className="h-10 w-10 mx-auto mb-2 text-gray-300" />
                    {t('No open tickets. New orders appear here automatically.')}
                </CardContent></Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {visibleOrders.map((order) => {
                        const st = ticketStatus(order._items);
                        return (
                            <div key={order.id} className={`rounded-lg border-2 ${TICKET_RING[st]} bg-white flex flex-col`}>
                                <div className="flex items-center justify-between px-3 py-2 border-b">
                                    <div>
                                        <span className="font-semibold text-sm">{order.order_number}</span>
                                        <span className="text-xs text-gray-400 ml-1">{order.table?.name ?? t(TYPE_LABEL[order.type] ?? order.type)}</span>
                                    </div>
                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock className="h-3 w-3" />{order.fired_at ? formatTime(order.fired_at) : ''}</span>
                                </div>
                                <div className="p-2 space-y-1 flex-1">
                                    {order._items.map((item) => (
                                        <div key={item.id} className={`flex items-center gap-2 rounded px-2 py-1 ${item.kitchen_status === 'ready' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                            <span className="font-semibold text-sm w-6">{item.quantity}×</span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm truncate ${item.kitchen_status === 'ready' ? 'line-through text-gray-400' : ''}`}>{item.name}</p>
                                                {item.modifiers && item.modifiers.length > 0 && <p className="text-xs text-gray-400 truncate">{item.modifiers.map((m) => m.name).join(', ')}</p>}
                                                {item.menu_item?.station?.name && station === 'all' && <span className="text-[10px] uppercase text-gray-400">{item.menu_item.station.name}</span>}
                                            </div>
                                            {canEdit && (item.kitchen_status === 'pending' ? (
                                                <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => setStatus(item, 'ready')}>{t('Ready')}</Button>
                                            ) : (
                                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-green-600" onClick={() => setStatus(item, 'served')}><Check className="h-3 w-3 mr-1" />{t('Serve')}</Button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                                {canEdit && st !== 'ready' && (
                                    <button onClick={() => allReady(order)} className="text-xs text-primary hover:underline py-1.5 border-t">{t('Mark all ready')}</button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
