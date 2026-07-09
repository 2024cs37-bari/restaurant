import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { ModifierGroup, Option } from './types';

export default function GroupDialog({ group, onSuccess }: { group?: ModifierGroup | null; onSuccess: () => void }) {
    const { t } = useTranslation();
    const isEdit = !!group;

    const { data, setData, post, put, processing, errors } = useForm<any>({
        name: group?.name ?? '',
        is_required: group?.is_required ?? false,
        min_select: group?.min_select?.toString() ?? '0',
        max_select: group?.max_select?.toString() ?? '',
        options: (group?.options ?? []).map((o) => ({ name: o.name, price: o.price?.toString() ?? '0' })),
    });

    const setOption = (i: number, key: 'name' | 'price', value: string) => {
        const next = [...data.options];
        next[i] = { ...next[i], [key]: value };
        setData('options', next);
    };
    const addOption = () => setData('options', [...data.options, { name: '', price: '0' }]);
    const removeOption = (i: number) => setData('options', data.options.filter((_: Option, x: number) => x !== i));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const done = { onSuccess: () => onSuccess(), preserveScroll: true };
        if (isEdit) put(route('restaurant.modifier-groups.update', group!.id), done);
        else post(route('restaurant.modifier-groups.store'), done);
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{isEdit ? t('Edit Modifier Group') : t('Create Modifier Group')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div>
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={t('e.g. Add-ons')} required />
                    <InputError message={errors.name} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label>{t('Required')}</Label>
                        <Select value={data.is_required ? '1' : '0'} onValueChange={(v) => setData('is_required', v === '1')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">{t('Optional')}</SelectItem>
                                <SelectItem value="1">{t('Required')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="min">{t('Min select')}</Label>
                        <Input id="min" type="number" min="0" value={data.min_select} onChange={(e) => setData('min_select', e.target.value)} />
                        <InputError message={errors.min_select} />
                    </div>
                    <div>
                        <Label htmlFor="max">{t('Max select')}</Label>
                        <Input id="max" type="number" min="0" value={data.max_select} onChange={(e) => setData('max_select', e.target.value)} placeholder={t('Any')} />
                        <InputError message={errors.max_select} />
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>{t('Options')}</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addOption}><Plus className="h-3 w-3 mr-1" />{t('Add')}</Button>
                    </div>
                    {data.options.length === 0 && <p className="text-xs text-gray-400">{t('Add options like Extra cheese (+50).')}</p>}
                    {data.options.map((o: any, i: number) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <Input placeholder={t('Option name')} value={o.name} onChange={(e) => setOption(i, 'name', e.target.value)} />
                            <Input type="number" step="0.01" min="0" className="w-32" placeholder={t('Price')} value={o.price} onChange={(e) => setOption(i, 'price', e.target.value)} />
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => removeOption(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                    <Button type="submit" disabled={processing}>{isEdit ? t('Update') : t('Create')}</Button>
                </div>
            </form>
        </DialogContent>
    );
}
