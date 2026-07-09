import { AuthContext } from '@/types/common';

export interface Waiter {
    id: number;
    name: string;
}

export interface RestaurantTable {
    id: number;
    area_id: number;
    name: string;
    seats: number;
    status: 'free' | 'seated' | 'reserved';
    waiter_id: number | null;
    waiter?: Waiter | null;
    pos_x: number;
    pos_y: number;
    merged_into_id: number | null;
    merged_tables?: { id: number; name: string; merged_into_id: number }[];
    is_active: boolean;
}

export interface Area {
    id: number;
    name: string;
    is_active: boolean;
    tables?: RestaurantTable[];
}

export interface FloorIndexProps {
    areas: Area[];
    waiters: Waiter[];
    auth: AuthContext;
    [key: string]: unknown;
}
