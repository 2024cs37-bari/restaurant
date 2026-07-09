import { AuthContext } from '@/types/common';

export interface KitchenItem {
    id: number;
    name: string;
    quantity: number;
    kitchen_status: 'pending' | 'ready' | 'served';
    modifiers?: { id: number; name: string }[];
    menu_item?: { id: number; kitchen_station_id: number | null; station?: { id: number; name: string } | null } | null;
}

export interface KitchenOrder {
    id: number;
    order_number: string;
    type: string;
    fired_at: string | null;
    table?: { id: number; name: string } | null;
    items?: KitchenItem[];
}

export interface Station { id: number; name: string; }

export interface KitchenIndexProps {
    orders: KitchenOrder[];
    stations: Station[];
    auth: AuthContext;
    [key: string]: unknown;
}
