import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Area } from './types';

export default function AreaDialog({ area, onSuccess }: { area?: Area | null; onSuccess: () => void }) {
    const { t } = useTranslation();
    const isEdit = !!area;
    const { data, setData, post, put, processing, errors } = useForm({
        name: area?.name ?? '',
        is_active: area?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = { onSuccess: () => onSuccess(), preserveScroll: true };
        if (isEdit) put(route('restaurant.areas.update', area!.id), done);
        else post(route('restaurant.areas.store'), done);
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>{isEdit ? t('Edit Area') : t('Create Area')}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={t('e.g. Terrace')} required />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <Label>{t('Status')}</Label>
                    <Select value={data.is_active ? '1' : '0'} onValueChange={(v) => setData('is_active', v === '1')}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">{t('Active')}</SelectItem>
                            <SelectItem value="0">{t('Inactive')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                    <Button type="submit" disabled={processing}>{isEdit ? t('Update') : t('Create')}</Button>
                </div>
            </form>
        </DialogContent>
    );
}
