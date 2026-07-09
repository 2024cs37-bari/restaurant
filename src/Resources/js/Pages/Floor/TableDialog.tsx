import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Area, RestaurantTable, Waiter } from './types';

interface Props {
    table?: RestaurantTable | null;
    areaId: number;
    areas: Area[];
    waiters: Waiter[];
    onSuccess: () => void;
}

export default function TableDialog({ table, areaId, areas, waiters, onSuccess }: Props) {
    const { t } = useTranslation();
    const isEdit = !!table;
    const { data, setData, post, put, transform, processing, errors } = useForm<any>({
        area_id: (table?.area_id ?? areaId).toString(),
        name: table?.name ?? '',
        seats: table?.seats?.toString() ?? '2',
        waiter_id: table?.waiter_id ? table.waiter_id.toString() : 'none',
        is_active: table?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        // 'none' is a Select sentinel (Radix disallows empty values) → send null.
        transform((d: any) => ({ ...d, waiter_id: d.waiter_id === 'none' ? null : d.waiter_id }));
        const done = { onSuccess: () => onSuccess(), preserveScroll: true };
        if (isEdit) put(route('restaurant.tables.update', table!.id), done);
        else post(route('restaurant.tables.store'), done);
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>{isEdit ? t('Edit Table') : t('Create Table')}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">{t('Name')}</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="T1" required />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label htmlFor="seats">{t('Seats')}</Label>
                        <Input id="seats" type="number" min="1" max="50" value={data.seats} onChange={(e) => setData('seats', e.target.value)} required />
                        <InputError message={errors.seats} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>{t('Area')}</Label>
                        <Select value={data.area_id} onValueChange={(v) => setData('area_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {areas.map((a) => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.area_id} />
                    </div>
                    <div>
                        <Label>{t('Waiter')}</Label>
                        <Select value={data.waiter_id} onValueChange={(v) => setData('waiter_id', v)}>
                            <SelectTrigger><SelectValue placeholder={t('Unassigned')} /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">{t('Unassigned')}</SelectItem>
                                {waiters.map((w) => <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                    <Button type="submit" disabled={processing}>{isEdit ? t('Update') : t('Create')}</Button>
                </div>
            </form>
        </DialogContent>
    );
}
