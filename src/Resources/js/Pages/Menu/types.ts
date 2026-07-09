import { AuthContext } from '@/types/common';

export interface Variation {
    id?: number;
    name: string;
    price: number | string;
    order?: number;
}

export interface ModifierOption {
    id: number;
    name: string;
    price: number | string;
}

export interface ModifierGroup {
    id: number;
    name: string;
    is_required: boolean;
    min_select: number;
    max_select: number | null;
    options: ModifierOption[];
}

export interface MenuItem {
    id: number;
    menu_category_id: number;
    name: string;
    description?: string;
    price: number | string;
    image?: string | null;
    prep_time_minutes?: number | null;
    is_available: boolean;
    order?: number;
    variations?: Variation[];
    modifier_groups?: ModifierGroup[];
}

export interface MenuCategory {
    id: number;
    name: string;
    description?: string;
    image?: string | null;
    is_active: boolean;
    order?: number;
    items?: MenuItem[];
}

export interface MenuIndexProps {
    categories: MenuCategory[];
    modifierGroups: ModifierGroup[];
    auth: AuthContext;
    [key: string]: unknown;
}
