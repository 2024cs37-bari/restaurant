import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaPicker from '@/components/MediaPicker';
import { MenuCategory } from './types';

export default function CategoryDialog({ category, onSuccess }: { category?: MenuCategory | null; onSuccess: () => void }) {
    const { t } = useTranslation();
    const isEdit = !!category;

    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? '',
        description: category?.description ?? '',
        image: category?.image ?? '',
        is_active: category?.is_active ?? true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = { onSuccess: () => onSuccess(), preserveScroll: true };
        if (isEdit) put(route('restaurant.menu-categories.update', category!.id), done);
        else post(route('restaurant.menu-categories.store'), done);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{isEdit ? t('Edit Category') : t('Create Category')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={t('e.g. Appetizers')} required />
                    <InputError message={errors.name} />
                </div>
                <div>
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} />
                    <InputError message={errors.description} />
                </div>
                <div>
                    <Label className="mb-1 block">{t('Image')}</Label>
                    <MediaPicker value={data.image} onChange={(v) => setData('image', Array.isArray(v) ? (v[0] ?? '') : v)} placeholder={t('Select image')} showPreview label="" />
                    <InputError message={errors.image} />
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
