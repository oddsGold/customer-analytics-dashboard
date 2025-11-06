'use client';

import React from 'react';
import { Category, Module } from '@prisma/client';
import { Edit, Trash2 } from 'lucide-react';

type FullModule = Module & {
    author: { fullName: string | null },
    category: { name: string }
};

interface ModulesTableProps {
    modules: FullModule[];
    onEdit: (module: FullModule) => void;
    onDelete: (id: number, name: string) => void;
}

export const ModulesTable: React.FC<ModulesTableProps> = ({
                                                              modules,
                                                              onEdit,
                                                              onDelete
                                                          }) => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase w-1/3">Назва</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Категорія</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase">Статус</th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase">Дії</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                {modules.map(mod => (
                    <tr key={mod.id}>
                        <td className="px-6 py-4">
                            <div className="font-medium text-sm text-gray-900 whitespace-normal break-words">
                                {mod.name}
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{mod.category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{mod.moduleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${mod.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {mod.isPublished ? 'Опубліковано' : 'Чернетка'}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                                onClick={() => onEdit(mod)}
                                className="text-indigo-600 hover:text-indigo-900"
                            >
                                <Edit className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => onDelete(mod.id, mod.name)}
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