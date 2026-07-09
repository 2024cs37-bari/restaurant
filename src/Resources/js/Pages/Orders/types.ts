import { AuthContext } from '@/types/common';

export interface OrderItemModifier { id: number; name: string; price: number | string; }
export interface OrderItem { id: number; name: string; unit_price: number | string; quantity: number; line_total: number | string; modifiers?: OrderItemModifier[]; }

export interface Order {
    id: number;
    order_number: string;
    type: 'dine_in' | 'takeaway' | 'delivery';
    table?: { id: number; name: string } | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    status: 'open' | 'completed' | 'cancelled';
    subtotal: number | string;
    discount: number | string;
    total: number | string;
    payment_method?: string | null;
    paid_at?: string | null;
    created_at: string;
    items?: OrderItem[];
}

export interface BankAccount { id: number; account_name: string; bank_name: string; }

export interface OrdersIndexProps {
    orders: Order[];
    bankAccounts: BankAccount[];
    auth: AuthContext;
    [key: string]: unknown;
}
