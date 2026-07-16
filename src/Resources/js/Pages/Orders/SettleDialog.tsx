import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { router } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/helpers';
import { Order, BankAccount } from './types';

export default function SettleDialog({ order, bankAccounts, onSuccess }: { order: Order; bankAccounts: BankAccount[]; onSuccess: () => void }) {
    const { t } = useTranslation();
    const [method, setMethod] = useState('Cash');
    const [bankAccountId, setBankAccountId] = useState('none');
    const [discount, setDiscount] = useState((Number(order.discount) || 0).toString());
    const [saving, setSaving] = useState(false);

    const total = Math.max(0, Number(order.subtotal) - (Number(discount) || 0));

    const settle = () => {
        setSaving(true);
        router.post(route('restaurant.orders.settle', order.id), {
            payment_method: method,
            bank_account_id: bankAccountId === 'none' ? null : bankAccountId,
            discount: Number(discount) || 0,
        }, { preserveScroll: true, onSuccess: () => onSuccess(), onFinish: () => setSaving(false) });
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>{t('Settle')} - {order.order_number}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>{t('Payment method')}</Label>
                        <Select value={method} onValueChange={setMethod}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Cash">{t('Cash')}</SelectItem>
                                <SelectItem value="Card">{t('Card')}</SelectItem>
                                <SelectItem value="Other">{t('Other')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>{t('Discount')}</Label>
                        <Input type="number" min="0" value={discount} onChange={(e) => setDiscount(e.target.value)} />
                    </div>
                </div>
                <div>
                    <Label>{t('Deposit to (bank/cash account)')}</Label>
                    <Select value={bankAccountId} onValueChange={setBankAccountId}>
                        <SelectTrigger><SelectValue placeholder={t('None')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t('None')}</SelectItem>
                            {bankAccounts.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.account_name} - {b.bank_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {bankAccounts.length === 0 && <p className="text-xs text-amber-600 mt-1">{t('No bank accounts found. Revenue posting to accounting needs one configured.')}</p>}
                </div>
                <div className="flex items-center justify-between font-semibold border-t pt-2">
                    <span>{t('Total')}</span><span className="text-green-600">{formatCurrency(total)}</span>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                <Button onClick={settle} disabled={saving}>{saving ? t('Saving...') : t('Mark Paid')}</Button>
            </DialogFooter>
        </DialogContent>
    );
}
