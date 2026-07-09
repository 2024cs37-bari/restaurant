import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { MenuItem, Product } from './types';

export default function RecipeDialog({ item, products, onSuccess }: { item: MenuItem; products: Product[]; onSuccess: () => void }) {
    const { t } = useTranslation();

    const { data, setData, post, processing } = useForm<any>({
        lines: (item.recipe ?? []).map((r) => ({ product_id: r.product_id.toString(), quantity: r.quantity?.toString() ?? '0' })),
    });

    const setLine = (i: number, key: 'product_id' | 'quantity', value: string) => {
        const next = [...data.lines];
        next[i] = { ...next[i], [key]: value };
        setData('lines', next);
    };
    const addLine = () => setData('lines', [...data.lines, { product_id: products[0]?.id?.toString() ?? '', quantity: '1' }]);
    const removeLine = (i: number) => setData('lines', data.lines.filter((_: any, x: number) => x !== i));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('restaurant.menu-items.recipe', item.id), { onSuccess: () => onSuccess(), preserveScroll: true });
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t('Recipe')} — {item.name}</DialogTitle></DialogHeader>
            <form onSubmit={submit} className="space-y-4">
                <p className="text-xs text-gray-500">{t('Ingredients consumed each time this item sells. Stock deducts on settlement.')}</p>
                {products.length === 0 && <p className="text-xs text-amber-600">{t('No product-service items found. Add ingredients in Product & Service first.')}</p>}

                {data.lines.length === 0 && <p className="text-sm text-gray-400">{t('No ingredients yet.')}</p>}
                {data.lines.map((line: any, i: number) => {
                    const unit = products.find((p) => p.id.toString() === line.product_id)?.unit;
                    return (
                        <div key={i} className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Select value={line.product_id} onValueChange={(v) => setLine(i, 'product_id', v)}>
                                    <SelectTrigger><SelectValue placeholder={t('Ingredient')} /></SelectTrigger>
                                    <SelectContent>
                                        {products.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-32">
                                <Input type="number" step="0.001" min="0" value={line.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} placeholder={t('Qty')} />
                            </div>
                            {unit && <span className="text-xs text-gray-400 pb-2">{unit}</span>}
                            <Button type="button" size="sm" variant="ghost" className="text-red-600" onClick={() => removeLine(i)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                    );
                })}

                <Button type="button" size="sm" variant="outline" onClick={addLine} disabled={products.length === 0}><Plus className="h-3 w-3 mr-1" />{t('Add ingredient')}</Button>

                <div className="flex justify-end gap-2 border-t pt-3">
                    <Button type="button" variant="outline" onClick={() => onSuccess()}>{t('Cancel')}</Button>
                    <Button type="submit" disabled={processing}>{t('Save Recipe')}</Button>
                </div>
            </form>
        </DialogContent>
    );
}
