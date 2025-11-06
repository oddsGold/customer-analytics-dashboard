'use client';

import React from 'react';
import { Category } from '@prisma/client';
import { Edit, Trash2 } from 'lucide-react';

type FullCategory = Category & { author: { fullName: string | null } };

interface CategoriesTableProps {
    categories: FullCategory[];
    onEdit: (category: FullCategory) => void;
    onDelete: (id: number, name: string) => void;
}

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
                                                                    categories,
                                                                    onEdit,
                                                                    onDelete
                                                                }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Назва</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Автор</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Дії</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {categories.map(cat => (
                    <tr key={cat.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{cat.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{cat.author?.fullName || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => onEdit(cat)}
                                className="text-indigo-600 hover:text-indigo-900"
                            >
                                <Edit className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => onDelete(cat.id, cat.name)}
                                className="ml-4 text-red-600 hover:text-red-900"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};