'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';

interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label: string;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
                                                              name,
                                                              label,
                                                              ...props
                                                          }) => {
    const { register } = useFormContext();

    return (
        <div className="flex items-center gap-2 text-left">
            <input
                id={name}
                type="checkbox"
                {...props}
                {...register(name)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
        </div>
    );
};