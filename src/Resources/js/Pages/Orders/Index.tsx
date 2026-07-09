import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Receipt } from "lucide-react";
import NoRecordsFound from '@/components/no-records-found';
import { formatCurrency, formatDateTime } from '@/utils/helpers';
import SettleDialog from './SettleDialog';
import { Order, OrdersIndexProps } from './types';

const STATUS_STYLE: Record<string, string> = {
    open: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-slate-100 text-slate-500',
};
const TYPE_LABEL: Record<string, string> = { dine_in: 'Dine-in', takeaway: 'Takeaway', delivery: 'Delivery' };

export default function Index() {
    const { t } = useTranslation();
    const { orders, bankAccounts, auth } = usePage<OrdersIndexProps>().props;
    const perms = auth.user?.permissions ?? [];
    const can = (p: string) => perms.includes(p);

    const [settle, setSettle] = useState<Order | null>(null);
    const [expanded, setExpanded] = useState<number | null>(null);

    const cancel = (id: number) => router.post(route('restaurant.orders.cancel', id), {}, { preserveScroll: true });

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Orders') }]}
            pageTitle={t('Orders')}
            pageActions={can('create-orders') ? <Button size="sm" onClick={() => router.get(route('restaurant.pos.index'))}><Plus className="h-4 w-4 mr-1" />{t('New Order')}</Button> : null}
        >
            <Head title={t('Orders')} />

            {orders.length === 0 ? (
                <Card><CardContent className="p-0">
                    <NoRecordsFound icon={Receipt} title={t('No orders yet')} description={t('Take an order from the POS screen.')}
                        createPermission="create-orders" onCreateClick={() => router.get(route('restaurant.pos.index'))} createButtonText={t('Open POS')} className="h-auto" />
                </CardContent></Card>
            ) : (
                <Card><CardContent className="p-0 divide-y">
                    {orders.map((o) => (
                        <div key={o.id}>
                            <div className="flex items-center gap-3 p-3">
                                <button className="flex-1 min-w-0 text-left" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{o.order_number}</span>
                                        <Badge className={STATUS_STYLE[o.status]}>{t(o.status.charAt(0).toUpperCase() + o.status.slice(1))}</Badge>
                                        <Badge variant="secondary">{t(TYPE_LABEL[o.type] ?? o.type)}</Badge>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {o.table?.name ? `${o.table.name} · ` : ''}{o.customer_name ? `${o.customer_name} · ` : ''}{formatDateTime(o.created_at)}
                                    </div>
                                </button>
                                <span className="font-semibold text-green-600">{formatCurrency(Number(o.total))}</span>
                                {can('edit-orders') && o.status === 'open' && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setSettle(o)}>{t('Settle')}</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => cancel(o.id)} className="text-red-600">{t('Cancel')}</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            {expanded === o.id && (
                                <div className="px-3 pb-3 bg-gray-50/60">
                                    <div className="divide-y">
                                        {(o.items ?? []).map((it) => (
                                            <div key={it.id} className="py-1.5 flex justify-between text-sm">
                                                <span className="text-gray-700">{it.quantity}× {it.name}{it.modifiers && it.modifiers.length > 0 ? ` (${it.modifiers.map((m) => m.name).join(', ')})` : ''}</span>
                                                <span className="text-gray-500">{formatCurrency(Number(it.line_total))}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 pt-2">
                                        <span>{t('Subtotal')} {formatCurrency(Number(o.subtotal))} · {t('Discount')} {formatCurrency(Number(o.discount))}</span>
                                        {o.payment_method && <span>{t('Paid')}: {o.payment_method}</span>}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </CardContent></Card>
            )}

            <Dialog open={!!settle} onOpenChange={(open) => !open && setSettle(null)}>
                {settle && <SettleDialog order={settle} bankAccounts={bankAccounts} onSuccess={() => setSettle(null)} />}
            </Dialog>
        </AuthenticatedLayout>
    );
}
