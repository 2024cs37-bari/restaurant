import { useState } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Minus, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { formatCurrency, getImagePath } from '@/utils/helpers';
import { orderTotals } from '../../utils/orderTotals.mjs';
import CustomizeDialog from './CustomizeDialog';
import { PosIndexProps, MenuItem, CartLine } from './types';

export default function Index() {
    const { t } = useTranslation();
    const { categories, tables, auth } = usePage<PosIndexProps>().props;

    const [activeCat, setActiveCat] = useState(categories[0]?.id ?? 0);
    const [type, setType] = useState<'dine_in' | 'takeaway' | 'delivery'>('dine_in');
    const [tableId, setTableId] = useState('none');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [discount, setDiscount] = useState('0');
    const [cart, setCart] = useState<CartLine[]>([]);
    const [customize, setCustomize] = useState<MenuItem | null>(null);
    const [placing, setPlacing] = useState(false);

    const totals = orderTotals(cart, Number(discount) || 0);

    const addToCart = (line: CartLine) => { setCart((c) => [...c, line]); setCustomize(null); };

    const tapItem = (item: MenuItem) => {
        const hasOptions = (item.variations?.length ?? 0) > 0 || (item.modifier_groups?.length ?? 0) > 0;
        if (hasOptions) { setCustomize(item); return; }
        // plain item: merge into an existing plain line if present
        setCart((c) => {
            const idx = c.findIndex((l) => l.menu_item_id === item.id && !l.menu_item_variation_id && l.modifiers.length === 0);
            if (idx >= 0) { const copy = [...c]; copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + 1 }; return copy; }
            return [...c, { key: `${item.id}-${Date.now()}`, menu_item_id: item.id, menu_item_variation_id: null, name: item.name, unit_price: Number(item.price) || 0, quantity: 1, modifiers: [] }];
        });
    };

    const setQty = (key: string, delta: number) => setCart((c) => c.map((l) => l.key === key ? { ...l, quantity: Math.max(1, l.quantity + delta) } : l));
    const removeLine = (key: string) => setCart((c) => c.filter((l) => l.key !== key));

    const placeOrder = () => {
        if (cart.length === 0) return;
        setPlacing(true);
        router.post(route('restaurant.orders.store'), {
            type,
            restaurant_table_id: type === 'dine_in' && tableId !== 'none' ? tableId : null,
            customer_name: customerName || null,
            customer_phone: customerPhone || null,
            customer_address: customerAddress || null,
            discount: Number(discount) || 0,
            lines: cart.map((l) => ({
                menu_item_id: l.menu_item_id,
                menu_item_variation_id: l.menu_item_variation_id,
                modifier_option_ids: l.modifiers.map((m) => m.modifier_option_id),
                quantity: l.quantity,
            })),
        }, { onFinish: () => setPlacing(false) });
    };

    const activeItems = categories.find((c) => c.id === activeCat)?.items ?? [];

    return (
        <AuthenticatedLayout breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('POS') }]} pageTitle={t('Point of Sale')}>
            <Head title={t('POS')} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Menu */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((c) => (
                            <button key={c.id} onClick={() => setActiveCat(c.id)}
                                className={`px-3 py-1.5 rounded text-sm ${activeCat === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{c.name}</button>
                        ))}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                        {activeItems.length === 0 && <p className="text-sm text-gray-400 col-span-full py-8 text-center">{t('No available items in this category.')}</p>}
                        {activeItems.map((item) => (
                            <button key={item.id} onClick={() => tapItem(item)} className="rounded-lg border bg-white overflow-hidden text-left hover:shadow-md transition-shadow">
                                <div className="h-20 bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {item.image ? <img src={getImagePath(item.image)} alt={item.name} className="h-full w-full object-cover" /> : <UtensilsCrossed className="h-6 w-6 text-gray-300" />}
                                </div>
                                <div className="p-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                    <p className="text-xs text-green-600 font-semibold">{(item.variations?.length ?? 0) > 0 ? `${t('From')} ${formatCurrency(Math.min(...item.variations!.map((v) => Number(v.price) || 0)))}` : formatCurrency(Number(item.price) || 0)}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Order panel */}
                <Card className="h-fit sticky top-4">
                    <CardContent className="p-4 space-y-3">
                        <div className="flex rounded-md border overflow-hidden text-sm">
                            {(['dine_in', 'takeaway', 'delivery'] as const).map((ty) => (
                                <button key={ty} onClick={() => setType(ty)} className={`flex-1 py-1.5 ${type === ty ? 'bg-primary text-primary-foreground' : ''}`}>
                                    {ty === 'dine_in' ? t('Dine-in') : ty === 'takeaway' ? t('Takeaway') : t('Delivery')}
                                </button>
                            ))}
                        </div>

                        {type === 'dine_in' ? (
                            <div>
                                <Label>{t('Table')}</Label>
                                <Select value={tableId} onValueChange={setTableId}>
                                    <SelectTrigger><SelectValue placeholder={t('Select table')} /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">{t('No table')}</SelectItem>
                                        {tables.map((tb) => <SelectItem key={tb.id} value={tb.id.toString()}>{tb.name} ({tb.seats})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Input placeholder={t('Customer name')} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                <Input placeholder={t('Phone')} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                                {type === 'delivery' && <Input placeholder={t('Address')} value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />}
                            </div>
                        )}

                        <div className="divide-y border-y max-h-72 overflow-y-auto">
                            {cart.length === 0 && <p className="text-sm text-gray-400 py-6 text-center">{t('Tap items to build the order.')}</p>}
                            {cart.map((l) => (
                                <div key={l.key} className="py-2 flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{l.name}</p>
                                        {l.modifiers.length > 0 && <p className="text-xs text-gray-400 truncate">{l.modifiers.map((m) => m.name).join(', ')}</p>}
                                        <p className="text-xs text-gray-500">{formatCurrency((l.unit_price + l.modifiers.reduce((s, m) => s + m.price, 0)) * l.quantity)}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setQty(l.key, -1)}><Minus className="h-3 w-3" /></Button>
                                        <span className="w-5 text-center text-sm">{l.quantity}</span>
                                        <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setQty(l.key, 1)}><Plus className="h-3 w-3" /></Button>
                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600" onClick={() => removeLine(l.key)}><Trash2 className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">{t('Discount')}</span>
                            <Input type="number" min="0" className="w-24 h-8" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-500">{t('Subtotal')}</span><span>{formatCurrency(totals.subtotal)}</span></div>
                        <div className="flex items-center justify-between font-semibold"><span>{t('Total')}</span><span className="text-green-600">{formatCurrency(totals.total)}</span></div>

                        <Button className="w-full" disabled={cart.length === 0 || placing} onClick={placeOrder}>{placing ? t('Placing...') : t('Place Order')}</Button>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!customize} onOpenChange={(open) => !open && setCustomize(null)}>
                {customize && <CustomizeDialog item={customize} onAdd={addToCart} onClose={() => setCustomize(null)} />}
            </Dialog>
        </AuthenticatedLayout>
    );
}
