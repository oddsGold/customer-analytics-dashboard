'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import {FormError} from "@/shared/components/shared/form/form-error";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    name: string;
    label: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
                                                          name,
                                                          label,
                                                          required,
                                                          options,
                                                          placeholder,
                                                          ...props
                                                      }) => {
    const { register } = useFormContext();

    return (
        <div className="flex flex-col text-left">
            <label htmlFor={name} className="mb-1 text-sm font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                id={name}
                {...props}
                {...register(name)}
                className="px-3 py-2 border shadow-sm rounded-[5px] focus:outline-none focus:ring-primary focus:border-primary"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <FormError name={name} />
        </div>
    );
};