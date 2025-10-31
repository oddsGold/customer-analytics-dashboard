import * as React from "react";
import { IMaskInput } from "react-imask";
import { cn } from "@/shared/lib/utils";

interface InputPhoneProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
    value?: string;
    onChange?: (value: string) => void;
}

const InputPhone = React.forwardRef<HTMLInputElement, InputPhoneProps>(
    ({ className, value, onChange, ...props }, ref) => {
        return (
            <IMaskInput
                mask={[
                    "+38 (000) 000-00-00",
                    "+38 (000) 000-00-00",
                    "+38 (00000) 00-00",
                ]}
                definitions={{
                    0: /\d/,
                }}
                value={value}
                onAccept={(val: string) => onChange?.(val)}
                className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                    className
                )}
                inputRef={ref}
                placeholder="+38 (___) ___-__-__"
                {...props}
            />
        );
    }
);

InputPhone.displayName = "InputPhone";

export { InputPhone };
