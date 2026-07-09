import { AuthContext } from '@/types/common';

export interface Option {
    id?: number;
    name: string;
    price: number | string;
}

export interface ModifierGroup {
    id: number;
    name: string;
    min_select: number;
    max_select: number | null;
    is_required: boolean;
    options: Option[];
}

export interface ModifierGroupsIndexProps {
    groups: ModifierGroup[];
    auth: AuthContext;
    [key: string]: unknown;
}
