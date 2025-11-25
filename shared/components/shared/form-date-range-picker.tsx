"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
    Button,
    FormField,
    Popover,
    PopoverContent,
    PopoverTrigger,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from "@/shared/components/ui";
import { Calendar } from "@/shared/components/ui/calendar";
import { uk } from "date-fns/locale";
import { Control } from "react-hook-form";

interface FormDateRangePickerProps {
    control: Control<any>;
    name: string;
    title: string;
    className?: string;
    trigger?: () => void;
}

interface SingleDateInputProps {
    value?: Date;
    onChange: (date?: Date) => void;
    placeholder: string;
    disabledDate?: Date;
    disableType?: "before" | "after";
}

function SingleDateInput({ value, onChange, placeholder, disabledDate, disableType }: SingleDateInputProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (date?: Date) => {
        onChange(date);
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(undefined);
    };

    const isDateDisabled = (date: Date) => {
        if (!disabledDate) return false;
        if (disableType === "before") return date < disabledDate;
        if (disableType === "after") return date > disabledDate;
        return false;
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal px-3",
                        "border-0 shadow-none bg-transparent hover:bg-transparent focus-visible:ring-0",

                        !value && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    <span className="flex-1">
                        {value ? format(value, "dd.MM.yyyy") : placeholder}
                    </span>
                    {value && (
                        <span
                            onClick={handleClear}
                            className="ml-2 hover:bg-accent hover:text-accent-foreground rounded-full p-0.5 cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    locale={uk}
                    selected={value}
                    onSelect={handleSelect}
                    disabled={isDateDisabled}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

export function FormDateRangePicker({ control, name, title = "Діапазон дат", className, trigger }: FormDateRangePickerProps) {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => {
                const currentRange = field.value || { from: undefined, to: undefined };

                const updateFrom = (date?: Date) => {
                    const newValue = { ...currentRange, from: date };
                    if (date && currentRange.to && date > currentRange.to) {
                        newValue.to = undefined;
                    }
                    field.onChange(newValue);
                    trigger?.();
                };

                const updateTo = (date?: Date) => {
                    const newValue = { ...currentRange, to: date };
                    field.onChange(newValue);
                    trigger?.();
                };

                const hasValue = !!currentRange.from || !!currentRange.to;

                return (
                    <FormItem className={cn("flex flex-col", className)}>
                        <FormLabel className="text-base">{title}</FormLabel>
                        <FormControl>
                            <div
                                className={cn(
                                    "flex gap-2 items-center rounded-[5px] border p-1 transition-all duration-200",

                                    hasValue
                                        ? "border-primary bg-primary/10"
                                        : "border-gray-200 bg-white hover:border-gray-300",

                                    fieldState.error && "border-destructive bg-destructive/5"
                                )}
                            >
                                <SingleDateInput
                                    value={currentRange.from}
                                    onChange={updateFrom}
                                    placeholder="З дати"
                                />

                                <div
                                    className={cn(
                                        "w-[1px] h-5 mx-1",
                                        hasValue
                                            ? "bg-primary/30"
                                            : "bg-gray-200"
                                    )}
                                />

                                <SingleDateInput
                                    value={currentRange.to}
                                    onChange={updateTo}
                                    placeholder="По дату"
                                    disabledDate={currentRange.from}
                                    disableType="before"
                                />
                            </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}