'use client';

import React, { useState } from 'react';
import { Category, Module } from '@prisma/client';
import { Button } from '@/shared/components/ui';
import {
    createCategory,
    updateCategory,
    deleteCategory,
    createModule,
    updateModule,
    deleteModule
} from '@/app/actions';
import {
    TCategoryFormValues,
    TModuleFormValues,
    TUpdateCategoryFormValues,
    TUpdateModuleFormValues
} from '@/shared/schemas/schemas';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {CategoryForm, ModuleForm} from "@/shared/components/shared/form";
import {Modal} from "@/shared/components/shared/modal";
import {DeleteConfirmModal} from "@/shared/components/shared/delete-confirm-modal";
import {CategoriesTable} from "@/shared/components/shared/categories-table";
import {ModulesTable} from "@/shared/components/shared/modules-table";

type FullCategory = Category & { author: { fullName: string | null } };
type FullModule = Module & { author: { fullName: string | null }, category: { name: string } };

interface DashboardProps {
    initialCategories: FullCategory[];
    initialModules: FullModule[];
}


export const SettingsDashboard: React.FC<DashboardProps> = ({
                                                                initialCategories,
                                                                initialModules,
                                                            }) => {
    const [activeTab, setActiveTab] = useState<'categories' | 'modules'>('categories');
    const router = useRouter();

    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
    const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<FullCategory | null>(null);
    const [editingModule, setEditingModule] = useState<FullModule | null>(null);
    const [deletingItem, setDeletingItem] = useState<{ id: number; name: string; type: 'category' | 'module' } | null>(null);

    const refreshData = () => {
        router.refresh();
        setIsCreateCategoryOpen(false);
        setIsCreateModuleOpen(false);
        setEditingCategory(null);
        setEditingModule(null);
        setDeletingItem(null);
    };

    const handleCreateCategory = async (data: TCategoryFormValues) => {
        await createCategory(data);
        refreshData();
    };

    const handleUpdateCategory = async (data: TUpdateCategoryFormValues) => {
        await updateCategory(data);
        refreshData();
    };

    const handleCreateModule = async (data: TModuleFormValues) => {
        await createModule(data);
        refreshData();
    };

    const handleUpdateModule = async (data: TUpdateModuleFormValues) => {
        await updateModule(data);
        refreshData();
    };

    const handleDelete = async () => {
        if (!deletingItem) return;
        if (deletingItem.type === 'category') {
            await deleteCategory(deletingItem.id);
        } else {
            await deleteModule(deletingItem.id);
        }
        refreshData();
    };


    return (
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'categories' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                    >
                        Керування Категоріями
                    </button>
                    <button
                        onClick={() => setActiveTab('modules')}
                        className={`border-b-2 py-3 px-1 text-sm font-medium ${activeTab === 'modules' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:border-gray-300'}`}
                    >
                        Керування Модулями
                    </button>
                </nav>
            </div>

            <div className="py-4">
                {activeTab === 'categories' && (
                    <div>
                        <Button onClick={() => setIsCreateCategoryOpen(true)} className="mb-4 rounded-[5px]">
                            <Plus className="h-4 w-4 mr-2" /> Додати Категорію
                        </Button>
                        <CategoriesTable
                            categories={initialCategories}
                            onEdit={setEditingCategory}
                            onDelete={(id, name) => setDeletingItem({ id, name, type: 'category' })}
                        />
                    </div>
                )}
                {activeTab === 'modules' && (
                    <div>
                        <Button onClick={() => setIsCreateModuleOpen(true)} className="mb-4 rounded-[5px]">
                            <Plus className="h-4 w-4 mr-2" /> Додати Модуль
                        </Button>
                        <ModulesTable
                            modules={initialModules}
                            onEdit={setEditingModule}
                            onDelete={(id, name) => setDeletingItem({ id, name, type: 'module' })}
                        />
                    </div>
                )}
            </div>


            <Modal title="Створити нову категорію" isOpen={isCreateCategoryOpen} onClose={() => setIsCreateCategoryOpen(false)}>
                <CategoryForm
                    defaultValues={{ name: '' }}
                    onSubmit={handleCreateCategory}
                    isEdit={false}
                />
            </Modal>

            {editingCategory && (
                <Modal title="Редагувати категорію" isOpen={!!editingCategory} onClose={() => setEditingCategory(null)}>
                    <CategoryForm
                        defaultValues={{
                            id: editingCategory.id,
                            name: editingCategory.name,
                        }}
                        onSubmit={handleUpdateCategory}
                        isEdit={true}
                    />
                </Modal>
            )}

            <Modal title="Створити новий модуль" isOpen={isCreateModuleOpen} onClose={() => setIsCreateModuleOpen(false)}>
                <ModuleForm
                    categories={initialCategories}
                    defaultValues={{ name: '', categoryId: '', isPublished: false, moduleId: '' as any }}
                    onSubmit={handleCreateModule}
                    isEdit={false}
                />
            </Modal>

            {editingModule && (
                <Modal title="Редагувати модуль" isOpen={!!editingModule} onClose={() => setEditingModule(null)}>
                    <ModuleForm
                        categories={initialCategories}
                        defaultValues={{
                            id: editingModule.id,
                            name: editingModule.name,
                            categoryId: String(editingModule.categoryId),
                            isPublished: editingModule.isPublished,
                            moduleId: editingModule.moduleId
                        }}
                        onSubmit={handleUpdateModule}
                        isEdit={true}
                    />
                </Modal>
            )}

            {deletingItem && (
                <DeleteConfirmModal
                    isOpen={!!deletingItem}
                    onClose={() => setDeletingItem(null)}
                    onConfirm={handleDelete}
                    itemName={deletingItem.name}
                />
            )}
        </div>
    );
};