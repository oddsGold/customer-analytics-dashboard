'use client';


import React from 'react';
import { useFormContext } from 'react-hook-form';

export const FormError: React.FC<{ name?: string }> = ({ name }) => {
    const { formState: { errors } } = useFormContext();
    if (!name) return null;

    const error = errors[name];
    if (!error) return null;

    return (
        <span className="text-xs text-red-500 mt-1 text-left">
            {String(error.message)}
        </span>
    );
};