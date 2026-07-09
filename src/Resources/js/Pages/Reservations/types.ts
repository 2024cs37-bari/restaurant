import { AuthContext } from '@/types/common';

export interface Reservation {
    id: number;
    restaurant_table_id: number | null;
    table?: { id: number; name: string } | null;
    customer_name: string;
    customer_phone?: string | null;
    party_size: number;
    reserved_at: string;
    status: 'booked' | 'seated' | 'cancelled' | 'no_show';
    notes?: string | null;
}

export interface TableOption {
    id: number;
    name: string;
    seats: number;
}

export interface ReservationsIndexProps {
    reservations: Reservation[];
    tables: TableOption[];
    auth: AuthContext;
    [key: string]: unknown;
}
