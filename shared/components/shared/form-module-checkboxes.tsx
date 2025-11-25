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
import {CategoryWithModules} from "@/shared/constants";
import {cn} from "@/shared/lib/utils";


interface FormModuleCheckboxesProps {
    control: Control<any>;
    categories: CategoryWithModules[];
}
export function FormModuleCheckboxes({
                                               control,
                                               categories
                                           }: FormModuleCheckboxesProps) {

    return (
        <FormField
            control={control}
            name="modules"
            render={({ field }) => (
                <FormItem>
                    <div className="mt-6 mb-4">
                        <FormLabel className="text-2xl">Перелік модулів:</FormLabel>
                    </div>

                    <div className="space-y-4">
                        {categories.map((category) => (
                            <div key={category.id}>
                                <h3 className="mb-2 font-medium text-gray-800 underline">
                                    {category.name}
                                </h3>
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {category.modules.map((module) => {
                                        const currentValue: string[] = field.value || [];

                                        const moduleValue = String(module.moduleId);

                                        const isChecked = currentValue.includes(moduleValue);

                                        const handleCheckedChange = (checkedState: boolean | 'indeterminate') => {
                                            const isNowChecked = !!checkedState;
                                            return isNowChecked
                                                ? field.onChange([...currentValue, moduleValue])
                                                : field.onChange(
                                                    currentValue.filter(
                                                        (value) => value !== moduleValue
                                                    )
                                                );
                                        };

                                        return (
                                            <FormItem
                                                key={module.id}
                                                className="space-y-0"
                                            >
                                                <FormLabel
                                                    className={cn(
                                                        "flex flex-row items-center space-x-3 rounded-[5px] border p-3 shadow-sm cursor-pointer transition-all duration-200",
                                                        isChecked
                                                            ? "border-primary bg-primary/10"
                                                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                                    )}
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={isChecked}
                                                            onCheckedChange={handleCheckedChange}
                                                        />
                                                    </FormControl>
                                                    <span className="font-normal text-sm cursor-pointer">
                                                        {module.name}
                                                    </span>
                                                </FormLabel>
                                            </FormItem>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}

