import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import InputError from '@/components/ui/input-error';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import MediaPicker from '@/components/MediaPicker';
import { formatCurrency } from '@/utils/helpers';
import { menuItemPrice } from '../../utils/menuItemPrice.mjs';
import { MenuItem, MenuCategory, ModifierGroup, Variation, Station } from './types';

interface Props {
    item?: MenuItem | null;
    categoryId: number;
    categories: MenuCategory[];
    modifierGroups: ModifierGroup[];
    stations: Station[];
    onSuccess: () => void;
}

export default function ItemDialog({ item, categoryId, categories, modifierGroups, stations, onSuccess }: Props) {
    const { t } = useTranslation();
    const isEdit = !!item;

    const { data, setData, post, put, transform, processing, errors } = useForm<any>({
        menu_category_id: (item?.menu_category_id ?? categoryId).toString(),
        kitchen_station_id: item?.kitchen_station_id ? item.kitchen_station_id.toString() : 'none',
        name: item?.name ?? '',
        description: item?.description ?? '',
        price: item?.price?.toString() ?? '0',
        prep_time_minutes: item?.prep_time_minutes?.toString() ?? '',
        image: item?.image ?? '',
        is_available: item?.is_available ?? true,
        variations: (item?.variations ?? []).map((v) => ({ name: v.name, price: v.price?.toString() ?? '0' })),
        modifier_group_ids: (item?.modifier_groups ?? []).map((g) => g.id),
    });

    const setVariation = (i: number, key: 'name' | 'price', value: string) => {
        const next = [...data.variations];
        next[i] = { ...next[i], [key]: value };
        setData('variations', next);
    };
    const addVariation = () => setData('variations', [...data.variations, { name: '', price: '0' }]);
    const removeVariation = (i: number) => setData('variations', data.variations.filter((_: Variation, x: number) => x !== i));

    const toggleGroup = (id: number) => {
        const has = data.modifier_group_ids.includes(id);
        setData('modifier_group_ids', has ? data.modifier_group_ids.filter((g: number) => g !== id) : [...data.modifier_group_ids, id]);
    };

    // Live base-price preview: lowest variation price if any, else base price.
    const previewItem = {
        price: Number(data.price) || 0,
        variations: data.variations.map((v: any, idx: number) => ({ id: idx, price: v.price })),
    };
    const previewPrice = data.variations.length
        ? Math.min(...data.variations.map((_: any, idx: number) => menuItemPrice(previewItem, idx, [])))
        : menuItemPrice(previewItem, null, []);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        transform((d: any) => ({ ...d, kitchen_station_id: d.kitchen_station_id === 'none' ? null : d.kitchen_station_id }));
        const done = { onSuccess: () => onSuccess(), preserveScroll: true };
        if (isEdit) put(route('restaurant.menu-items.update', item!.id), done);
        else post(route('restaurant.menu-items.store'), done);
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{isEdit ? t('Edit Item') : t('Create Item')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">{t('Name')}</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>
                    <div>
                        <Label>{t('Category')}</Label>
                        <Select value={data.menu_category_id} onValueChange={(v) => setData('menu_category_id', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.menu_category_id} />
                    </div>
                </div>

                <div>
                    <Label htmlFor="description">{t('Description')}</Label>
                    <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={2} />
                </div>

                <div>
                    <Label className="mb-1 block">{t('Image')}</Label>
                    <MediaPicker value={data.image} onChange={(v) => setData('image', Array.isArray(v) ? (v[0] ?? '') : v)} placeholder={t('Select image')} showPreview label="" />
                    <InputError message={errors.image} />
                </div>

                <div>
                    <Label>{t('Kitchen Station')}</Label>
                    <Select value={data.kitchen_station_id} onValueChange={(v) => setData('kitchen_station_id', v)}>
                        <SelectTrigger><SelectValue placeholder={t('Unassigned')} /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">{t('Unassigned')}</SelectItem>
                            {stations.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.kitchen_station_id} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <Label htmlFor="price">{t('Base Price')}</Label>
                        <Input id="price" type="number" step="0.01" min="0" value={data.price} onChange={(e) => setData('price', e.target.value)} required />
                        <InputError message={errors.price} />
                    </div>
                    <div>
                        <Label htmlFor="prep">{t('Prep Time (min)')}</Label>
                        <Input id="prep" type="number" min="0" value={data.prep_time_minutes} onChange={(e) => setData('prep_time_minutes', e.target.value)} />
                    </div>
                    <div>
                        <Label>{t('Availability')}</Label>
                        <Select value={data.is_available ? '1' : '0'} onValueChange={(v) => setData('is_available', v === '1')}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">{t('Available')}</SelectItem>
                                <SelectItem value="0">{t('Unavailable')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Variations */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <Label>{t('Size Variations')}</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addVariation}><Plus className="h-3 w-3 mr-1" />{t('Add')}</Button>
                    </div>
                    {data.variations.length === 0 && <p className="text-xs text-gray-400">{t('No variations — the base price is used.')}</p>}
                    {data.variations.map((v: any, i: number) => (
                        <div key={i} className="flex gap-2 mb-2">
                            <Input placeholder={t('e.g. Large')} value={v.name} onChange={(e) => setVariation(i, 'name', e.target.value)} />
                            <Input type="number" step="0.01" min="0" className="w-32" placeholder={t('Price')} value={v.price} onChange={(e) => setVariation(i, 'price', e.target.value)} />
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => removeVariation(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    ))}
                </div>

                {/* Modifier groups */}
                <div>
                    <Label>{t('Modifier Groups')}</Label>
                    {modifierGroups.length === 0 && <p className="text-xs text-gray-400">{t('No modifier groups defined yet.')}</p>}
                    <div className="flex flex-wrap gap-2 mt-1">
                        {modifierGroups.map((g) => {
                            const active = data.modifier_group_ids.includes(g.id);
                            return (
                                <button type="button" key={g.id} onClick={() => toggleGroup(g.id)}
                                    className={`text-xs px-2 py-1 rounded border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-gray-600'}`}>
                                    {g.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-sm text-gray-500">{t('From')} <span className="font-semibold text-green-600">{formatCurrency(previewPrice)}</span></span>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                        <Button type="submit" disabled={processing}>{isEdit ? t('Update') : t('Create')}</Button>
                    </div>
                </div>
            </form>
        </DialogContent>
    );
}
