import { router } from "@inertiajs/react";
import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Edit as EditIcon, Trash2, Clock, UtensilsCrossed } from "lucide-react";
import { formatCurrency, getImagePath } from '@/utils/helpers';
import { MenuItem } from './types';

interface Props {
    item: MenuItem;
    canEdit: boolean;
    canDelete: boolean;
    onEdit: (item: MenuItem) => void;
    onDelete: (id: number) => void;
}

export default function ItemCard({ item, canEdit, canDelete, onEdit, onDelete }: Props) {
    const { t } = useTranslation();

    const priceLabel = () => {
        if (item.variations && item.variations.length > 0) {
            const min = Math.min(...item.variations.map((v) => Number(v.price) || 0));
            return `${t('From')} ${formatCurrency(min)}`;
        }
        return formatCurrency(Number(item.price) || 0);
    };

    const toggle = () => router.post(route('restaurant.menu-items.toggle-availability', item.id), {}, { preserveScroll: true });

    return (
        <div className={`rounded-lg border bg-white overflow-hidden flex flex-col ${item.is_available ? '' : 'opacity-60'}`}>
            <div className="h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                {item.image
                    ? <img src={getImagePath(item.image)} alt={item.name} className="h-full w-full object-cover" />
                    : <UtensilsCrossed className="h-8 w-8 text-gray-300" />}
            </div>
            <div className="p-3 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                    <h4 className="font-medium text-sm text-gray-900 leading-tight">{item.name}</h4>
                    {(canEdit || canDelete) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreVertical className="h-3 w-3" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canEdit && <DropdownMenuItem onClick={() => onEdit(item)}><EditIcon className="h-3 w-3 mr-2" />{t('Edit')}</DropdownMenuItem>}
                                {canDelete && <DropdownMenuItem onClick={() => onDelete(item.id)} className="text-red-600"><Trash2 className="h-3 w-3 mr-2" />{t('Delete')}</DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
                {item.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>}
                <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-600">{priceLabel()}</span>
                    {item.prep_time_minutes ? <span className="inline-flex items-center gap-1 text-xs text-gray-400"><Clock className="h-3 w-3" />{item.prep_time_minutes}m</span> : null}
                </div>
                {canEdit && (
                    <button onClick={toggle}
                        className={`mt-2 text-xs font-medium px-2 py-1 rounded ${item.is_available ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.is_available ? t('Available') : t('Unavailable')}
                    </button>
                )}
            </div>
        </div>
    );
}
