import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Reservation, TableOption } from './types';

interface Props {
    reservation?: Reservation | null;
    tables: TableOption[];
    onSuccess: () => void;
}

export default function ReservationDialog({ reservation, tables, onSuccess }: Props) {
    const { t } = useTranslation();
    const isEdit = !!reservation;

    const { data, setData, post, put, transform, processing, errors } = useForm<any>({
        customer_name: reservation?.customer_name ?? '',
        customer_phone: reservation?.customer_phone ?? '',
        party_size: reservation?.party_size?.toString() ?? '2',
        reserved_at: reservation?.reserved_at ? reservation.reserved_at.substring(0, 16) : '',
        restaurant_table_id: reservation?.restaurant_table_id ? reservation.restaurant_table_id.toString() : 'none',
        notes: reservation?.notes ?? '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((d: any) => ({ ...d, restaurant_table_id: d.restaurant_table_id === 'none' ? null : d.restaurant_table_id }));
        const done = { onSuccess: () => onSuccess(), preserveScroll: true };
        if (isEdit) put(route('restaurant.reservations.update', reservation!.id), done);
        else post(route('restaurant.reservations.store'), done);
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>{isEdit ? t('Edit Reservation') : t('New Reservation')}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="customer_name">{t('Customer')}</Label>
                        <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required />
                        <InputError message={errors.customer_name} />
                    </div>
                    <div>
                        <Label htmlFor="customer_phone">{t('Phone')}</Label>
                        <Input id="customer_phone" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="party_size">{t('Party size')}</Label>
                        <Input id="party_size" type="number" min="1" max="100" value={data.party_size} onChange={(e) => setData('party_size', e.target.value)} required />
                        <InputError message={errors.party_size} />
                    </div>
                    <div>
                        <Label htmlFor="reserved_at">{t('Date & time')}</Label>
                        <Input id="reserved_at" type="datetime-local" value={data.reserved_at} onChange={(e) => setData('reserved_at', e.target.value)} required />
                        <InputError message={errors.reserved_at} />
                    </div>
                </div>
                <div>
                    <Label>{t('Table')}</Label>
                    <Select value={data.restaurant_table_id} onValueChange={(v) => setData('restaurant_table_id', v)}>
                        <SelectTrigger><SelectValue placeholder={t('No table yet')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t('No table yet')}</SelectItem>
                            {tables.map((tb) => <SelectItem key={tb.id} value={tb.id.toString()}>{tb.name} ({tb.seats})</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="notes">{t('Notes')}</Label>
                    <Textarea id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} rows={2} />
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                    <Button type="submit" disabled={processing}>{isEdit ? t('Update') : t('Create')}</Button>
                </div>
            </form>
        </DialogContent>
    );
}
