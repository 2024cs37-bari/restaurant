import { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Label } from '@/components/ui/label';
import { Minus, Plus } from 'lucide-react';
import { formatCurrency } from '@/utils/helpers';
import { menuItemPrice } from '../../utils/menuItemPrice.mjs';
import { MenuItem, CartLine } from './types';

export default function CustomizeDialog({ item, onAdd, onClose }: { item: MenuItem; onAdd: (line: CartLine) => void; onClose: () => void }) {
    const { t } = useTranslation();
    const variations = item.variations ?? [];
    const groups = item.modifier_groups ?? [];
    const [variationId, setVariationId] = useState<number | null>(variations[0]?.id ?? null);
    const [selected, setSelected] = useState<number[]>([]);
    const [qty, setQty] = useState(1);

    const toggle = (id: number) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
    const unit = menuItemPrice({ price: item.price, variations, modifier_groups: groups }, variationId, selected);

    const add = () => {
        const variation = variations.find((v) => v.id === variationId);
        const mods = groups.flatMap((g) => g.options).filter((o) => selected.includes(o.id))
            .map((o) => ({ modifier_option_id: o.id, name: o.name, price: Number(o.price) || 0 }));
        onAdd({
            key: `${item.id}-${variationId ?? 0}-${selected.join('.')}-${Date.now()}`,
            menu_item_id: item.id,
            menu_item_variation_id: variationId,
            name: item.name + (variation ? ` - ${variation.name}` : ''),
            unit_price: Number(variation ? variation.price : item.price) || 0,
            quantity: qty,
            modifiers: mods,
        });
    };

    return (
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{item.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
                {variations.length > 0 && (
                    <div>
                        <Label className="mb-1 block">{t('Size')}</Label>
                        <div className="flex flex-wrap gap-2">
                            {variations.map((v) => (
                                <button key={v.id} type="button" onClick={() => setVariationId(v.id)}
                                    className={`text-sm px-3 py-1.5 rounded border ${variationId === v.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>
                                    {v.name} · {formatCurrency(Number(v.price) || 0)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {groups.map((g) => (
                    <div key={g.id}>
                        <Label className="mb-1 block">{g.name}{g.is_required ? ' *' : ''}</Label>
                        <div className="flex flex-wrap gap-2">
                            {g.options.map((o) => (
                                <button key={o.id} type="button" onClick={() => toggle(o.id)}
                                    className={`text-sm px-3 py-1.5 rounded border ${selected.includes(o.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background'}`}>
                                    {o.name}{Number(o.price) > 0 ? ` +${formatCurrency(Number(o.price))}` : ''}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
                <div className="flex items-center gap-3">
                    <Label>{t('Qty')}</Label>
                    <div className="flex items-center gap-2">
                        <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
                        <span className="w-6 text-center">{qty}</span>
                        <Button type="button" size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => setQty((q) => q + 1)}><Plus className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>{t('Cancel')}</Button>
                <Button onClick={add}>{t('Add')} · {formatCurrency(unit * qty)}</Button>
            </DialogFooter>
        </DialogContent>
    );
}
