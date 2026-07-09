import { UtensilsCrossed } from 'lucide-react';

declare global {
    function route(name: string): string;
}

export const restaurantCompanyMenu = (t: (key: string) => string) => [
    {
        title: t('Restaurant'),
        icon: UtensilsCrossed,
        permission: 'manage-menu',
        order: 520,
        children: [
            {
                title: t('POS'),
                href: route('restaurant.pos.index'),
                permission: 'create-orders',
            },
            {
                title: t('Orders'),
                href: route('restaurant.orders.index'),
                permission: 'manage-orders',
            },
            {
                title: t('Kitchen'),
                href: route('restaurant.kitchen.index'),
                permission: 'manage-kitchen',
            },
            {
                title: t('Menu'),
                href: route('restaurant.menu.index'),
                permission: 'manage-menu',
            },
            {
                title: t('Modifiers'),
                href: route('restaurant.modifier-groups.index'),
                permission: 'manage-modifier-groups',
            },
            {
                title: t('Kitchen Stations'),
                href: route('restaurant.kitchen-stations.index'),
                permission: 'manage-kitchen',
            },
            {
                title: t('Floor'),
                href: route('restaurant.floor.index'),
                permission: 'manage-tables',
            },
            {
                title: t('Reservations'),
                href: route('restaurant.reservations.index'),
                permission: 'manage-reservations',
            },
        ],
    },
];
