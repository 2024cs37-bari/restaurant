import { AuthContext } from '@/types/common';

export interface Variation { id: number; name: string; price: number | string; }
export interface Option { id: number; name: string; price: number | string; }
export interface ModifierGroup {
    id: number; name: string; is_required: boolean; min_select: number; max_select: number | null;
    options: Option[];
}
export interface MenuItem {
    id: number; menu_category_id: number; name: string; price: number | string;
    image?: string | null; is_available: boolean;
    variations?: Variation[]; modifier_groups?: ModifierGroup[];
}
export interface MenuCategory { id: number; name: string; items?: MenuItem[]; }

export interface TableOption { id: number; name: string; seats: number; status: string; }
export interface OpenOrder { id: number; order_number: string; type: string; total: number | string; table?: { name: string } | null; }

// A cart line held in local POS state.
export interface CartLine {
    key: string;
    menu_item_id: number;
    menu_item_variation_id: number | null;
    name: string;
    unit_price: number;
    quantity: number;
    modifiers: { modifier_option_id: number; name: string; price: number }[];
}

export interface PosIndexProps {
    categories: MenuCategory[];
    tables: TableOption[];
    openOrders: OpenOrder[];
    auth: AuthContext;
    [key: string]: unknown;
}
