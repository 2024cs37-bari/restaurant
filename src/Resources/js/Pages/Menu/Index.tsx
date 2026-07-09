import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { useDeleteHandler } from '@/hooks/useDeleteHandler';
import AuthenticatedLayout from "@/layouts/authenticated-layout";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Plus, Edit as EditIcon, Trash2, UtensilsCrossed } from "lucide-react";
import NoRecordsFound from '@/components/no-records-found';
import ItemCard from './ItemCard';
import CategoryDialog from './CategoryDialog';
import ItemDialog from './ItemDialog';
import { MenuCategory, MenuItem, MenuIndexProps } from './types';

export default function Index() {
    const { t } = useTranslation();
    const { categories, modifierGroups, stations, auth } = usePage<MenuIndexProps>().props;
    const perms = auth.user?.permissions ?? [];
    const can = (p: string) => perms.includes(p);

    const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; data: MenuCategory | null }>({ open: false, data: null });
    const [itemDialog, setItemDialog] = useState<{ open: boolean; data: MenuItem | null; categoryId: number }>({ open: false, data: null, categoryId: 0 });

    const categoryDelete = useDeleteHandler({ routeName: 'restaurant.menu-categories.destroy', defaultMessage: t('Delete this category?') });
    const itemDelete = useDeleteHandler({ routeName: 'restaurant.menu-items.destroy', defaultMessage: t('Delete this item?') });

    return (
        <AuthenticatedLayout
            breadcrumbs={[{ label: t('Restaurant'), url: route('restaurant.menu.index') }, { label: t('Menu') }]}
            pageTitle={t('Menu')}
            pageActions={can('create-menu') ? (
                <Button size="sm" onClick={() => setCategoryDialog({ open: true, data: null })}>
                    <Plus className="h-4 w-4 mr-1" />{t('Add Category')}
                </Button>
            ) : null}
        >
            <Head title={t('Menu')} />

            {categories.length === 0 ? (
                <Card><CardContent className="p-0">
                    <NoRecordsFound
                        icon={UtensilsCrossed}
                        title={t('No menu yet')}
                        description={t('Start by creating a category, then add items to it.')}
                        createPermission="create-menu"
                        onCreateClick={() => setCategoryDialog({ open: true, data: null })}
                        createButtonText={t('Add Category')}
                        className="h-auto"
                    />
                </CardContent></Card>
            ) : (
                <div className="space-y-6">
                    {categories.map((category) => (
                        <Card key={category.id}>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold">{category.name}</h3>
                                        {!category.is_active && <span className="text-xs text-gray-400">({t('Inactive')})</span>}
                                        <span className="text-xs text-gray-400">· {category.items?.length ?? 0} {t('items')}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {can('create-menu') && (
                                            <Button size="sm" variant="outline" onClick={() => setItemDialog({ open: true, data: null, categoryId: category.id })}>
                                                <Plus className="h-3 w-3 mr-1" />{t('Add Item')}
                                            </Button>
                                        )}
                                        {can('edit-menu') && (
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600" onClick={() => setCategoryDialog({ open: true, data: category })}>
                                                <EditIcon className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {can('delete-menu') && (
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600" onClick={() => categoryDelete.openDeleteDialog(category.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {(category.items?.length ?? 0) === 0 ? (
                                    <p className="text-sm text-gray-400 py-4 text-center">{t('No items in this category yet.')}</p>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                        {category.items!.map((item) => (
                                            <ItemCard
                                                key={item.id}
                                                item={item}
                                                canEdit={can('edit-menu')}
                                                canDelete={can('delete-menu')}
                                                onEdit={(it) => setItemDialog({ open: true, data: it, categoryId: it.menu_category_id })}
                                                onDelete={(id) => itemDelete.openDeleteDialog(id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={categoryDialog.open} onOpenChange={(open) => setCategoryDialog({ open, data: open ? categoryDialog.data : null })}>
                {categoryDialog.open && (
                    <CategoryDialog category={categoryDialog.data} onSuccess={() => setCategoryDialog({ open: false, data: null })} />
                )}
            </Dialog>

            <Dialog open={itemDialog.open} onOpenChange={(open) => setItemDialog({ ...itemDialog, open, data: open ? itemDialog.data : null })}>
                {itemDialog.open && (
                    <ItemDialog
                        item={itemDialog.data}
                        categoryId={itemDialog.categoryId}
                        categories={categories}
                        modifierGroups={modifierGroups}
                        stations={stations}
                        onSuccess={() => setItemDialog({ open: false, data: null, categoryId: 0 })}
                    />
                )}
            </Dialog>

            <ConfirmationDialog
                open={categoryDelete.deleteState.isOpen}
                onOpenChange={categoryDelete.closeDeleteDialog}
                title={t('Delete Category')}
                message={categoryDelete.deleteState.message}
                confirmText={t('Delete')}
                onConfirm={categoryDelete.confirmDelete}
                variant="destructive"
            />
            <ConfirmationDialog
                open={itemDelete.deleteState.isOpen}
                onOpenChange={itemDelete.closeDeleteDialog}
                title={t('Delete Item')}
                message={itemDelete.deleteState.message}
                confirmText={t('Delete')}
                onConfirm={itemDelete.confirmDelete}
                variant="destructive"
            />
        </AuthenticatedLayout>
    );
}
