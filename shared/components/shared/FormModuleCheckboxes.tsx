"use client";

import * as React from "react";
import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
    Checkbox,
} from "@/shared/components/ui";
import { Control } from "react-hook-form";


const modules = [
    { id: "1", label: "каса Cashalot (ID 1)" },
    { id: "2", label: "FSAPI (ID 2)" },
    { id: "3", label: "COM/ApiBridge (ID 3)" },
    { id: "4", label: "драйвер BAS (ID 4)" },
    { id: "5", label: "каса + драйвер COM/ApiBridge (ID 5)" },
    { id: "6", label: "каса + драйвер BAS (ID 6)" },
    { id: "101", label: "Cклад (ID 101)" },
];

export function FormModuleCheckboxes({ control }: { control: Control<any> }) {
    return (
        <FormField
            control={control}
            name="modules"
            render={() => (
                <FormItem>
                    <div className="mt-6">
                        <FormLabel className="text-base">Перелік модулів</FormLabel>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {modules.map((module) => (
                            <FormField
                                key={module.id}
                                control={control}
                                name="modules"
                                render={({ field }) => {
                                    const currentValue: string[] = field.value || [];
                                    const isChecked = currentValue.includes(module.id);

                                    const handleCheckedChange = (checkedState: boolean | 'indeterminate') => {
                                        const isNowChecked = !!checkedState;
                                        return isNowChecked
                                            ? field.onChange([...currentValue, module.id])
                                            : field.onChange(
                                                currentValue.filter(
                                                    (value) => value !== module.id
                                                )
                                            );
                                    };

                                    return (
                                        <FormItem
                                            key={module.id}
                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-[5px] cursor-pointer border border-primary p-3 bg-white/50 shadow-sm hover:bg-secondary"
                                            onClick={() => handleCheckedChange(!isChecked)}
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={isChecked}
                                                    onCheckedChange={handleCheckedChange}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </FormControl>
                                            <FormLabel
                                                className="font-normal text-sm cursor-pointer"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {module.label}
                                            </FormLabel>
                                        </FormItem>
                                    );
                                }}
                            />
                        ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
