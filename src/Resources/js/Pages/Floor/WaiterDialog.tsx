import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { router } from "@inertiajs/react";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RestaurantTable, Waiter } from './types';

export default function WaiterDialog({ table, waiters, onSuccess }: { table: RestaurantTable; waiters: Waiter[]; onSuccess: () => void }) {
    const { t } = useTranslation();
    const [waiterId, setWaiterId] = useState(table.waiter_id ? table.waiter_id.toString() : 'none');

    const save = () => {
        router.post(route('restaurant.tables.assign-waiter', table.id),
            { waiter_id: waiterId === 'none' ? null : waiterId },
            { preserveScroll: true, onSuccess: () => onSuccess() });
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>{t('Assign Waiter')} — {table.name}</DialogTitle></DialogHeader>
            <div className="py-2">
                <Label>{t('Waiter')}</Label>
                <Select value={waiterId} onValueChange={setWaiterId}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder={t('Unassigned')} /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">{t('Unassigned')}</SelectItem>
                        {waiters.map((w) => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                <Button onClick={save}>{t('Save')}</Button>
            </DialogFooter>
        </DialogContent>
    );
}
