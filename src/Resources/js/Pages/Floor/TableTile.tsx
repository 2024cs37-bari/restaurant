import { useTranslation } from 'react-i18next';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { MoreVertical, Users, User as UserIcon, Link2, Unlink } from "lucide-react";
import { RestaurantTable } from './types';

type Action = 'seat' | 'free' | 'reserve' | 'waiter' | 'split' | 'edit' | 'delete';

interface Props {
    table: RestaurantTable;
    canEdit: boolean;
    canDelete: boolean;
    mergeMode: boolean;
    selected: boolean;
    onSelect: (table: RestaurantTable) => void;
    onAction: (action: Action, table: RestaurantTable) => void;
    style?: React.CSSProperties;
    onDragStart?: (e: React.MouseEvent, table: RestaurantTable) => void;
    draggable?: boolean;
}

const STATUS: Record<string, { ring: string; bg: string; label: string }> = {
    free: { ring: 'border-green-400', bg: 'bg-green-50', label: 'Free' },
    seated: { ring: 'border-amber-400', bg: 'bg-amber-50', label: 'Seated' },
    reserved: { ring: 'border-blue-400', bg: 'bg-blue-50', label: 'Reserved' },
};

export default function TableTile({ table, canEdit, canDelete, mergeMode, selected, onSelect, onAction, style, onDragStart, draggable }: Props) {
    const { t } = useTranslation();
    const s = STATUS[table.status] ?? STATUS.free;
    const isMerged = !!table.merged_into_id;
    const isPrimary = (table.merged_tables?.length ?? 0) > 0;

    return (
        <div
            style={style}
            onMouseDown={draggable && !mergeMode ? (e) => onDragStart?.(e, table) : undefined}
            className={`relative w-28 h-24 rounded-lg border-2 ${s.ring} ${s.bg} p-2 flex flex-col select-none
                ${mergeMode ? 'cursor-pointer' : draggable ? 'cursor-move' : ''}
                ${selected ? 'ring-2 ring-primary' : ''} ${isMerged ? 'opacity-70' : ''}`}
            onClick={mergeMode ? () => onSelect(table) : undefined}
        >
            <div className="flex items-start justify-between">
                <span className="font-semibold text-sm text-gray-800">{table.name}</span>
                {!mergeMode && (canEdit || canDelete) && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="h-5 w-5 flex items-center justify-center text-gray-400 hover:text-gray-700"><MoreVertical className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {canEdit && table.status !== 'seated' && <DropdownMenuItem onClick={() => onAction('seat', table)}>{t('Seat')}</DropdownMenuItem>}
                            {canEdit && table.status !== 'free' && <DropdownMenuItem onClick={() => onAction('free', table)}>{t('Free')}</DropdownMenuItem>}
                            {canEdit && table.status === 'free' && <DropdownMenuItem onClick={() => onAction('reserve', table)}>{t('Reserve')}</DropdownMenuItem>}
                            {canEdit && <DropdownMenuItem onClick={() => onAction('waiter', table)}><UserIcon className="h-3 w-3 mr-2" />{t('Assign waiter')}</DropdownMenuItem>}
                            {canEdit && (isMerged || isPrimary) && <DropdownMenuItem onClick={() => onAction('split', table)}><Unlink className="h-3 w-3 mr-2" />{t('Split')}</DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            {canEdit && <DropdownMenuItem onClick={() => onAction('edit', table)}>{t('Edit')}</DropdownMenuItem>}
                            {canDelete && <DropdownMenuItem onClick={() => onAction('delete', table)} className="text-red-600">{t('Delete')}</DropdownMenuItem>}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
            <div className="mt-auto text-xs text-gray-500 space-y-0.5">
                <div className="flex items-center gap-1"><Users className="h-3 w-3" />{table.seats}{isPrimary ? ` (+${table.merged_tables!.length})` : ''}</div>
                {table.waiter?.name && <div className="flex items-center gap-1 truncate"><UserIcon className="h-3 w-3" />{table.waiter.name}</div>}
                {isMerged && <div className="flex items-center gap-1 text-gray-400"><Link2 className="h-3 w-3" />{t('merged')}</div>}
            </div>
        </div>
    );
}
