'use client';

import {useForm, useFormContext} from 'react-hook-form';
import {ClearButton, ErrorText, RequiredSymbol} from "@/shared/components/shared";
import {InputPhone} from "@/shared/components/ui/input-phone";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label?: string;
    required?: boolean;
    className?: string;
}

export const  FormInputPhone: React.FC<Props> = ({ className, name, label, required, ...props }) => {
    const {
        register,
        formState: { errors },
        watch,
        setValue,
    } = useFormContext();

    const value = watch(name) || '';
    const errorText = errors[name]?.message as string;

    const onClickClear = () => {
        setValue(name, '', { shouldValidate: true });
        document.querySelector<HTMLInputElement>(`input[name="${name}"]`)?.blur();
    };

    return (
        <div className={className}>
            {label && (
                <p className="font-medium mb-2">
                    {label} {required && <RequiredSymbol />}
                </p>
            )}

            <div className="relative">
                <InputPhone
                    className="h-12 text-md"
                    {...register(name)}
                    value={value}
                    onChange={(value) => setValue(name, value, { shouldValidate: true })}
                />

                {value.length > 0 && <ClearButton onClick={onClickClear} />}
            </div>

            {errorText && <ErrorText text={errorText} className="mt-1" />}
        </div>
    );
};