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
                title: t('Menu'),
                href: route('restaurant.menu.index'),
                permission: 'manage-menu',
            },
            {
                title: t('Modifiers'),
                href: route('restaurant.modifier-groups.index'),
                permission: 'manage-modifier-groups',
            },
        ],
    },
];
