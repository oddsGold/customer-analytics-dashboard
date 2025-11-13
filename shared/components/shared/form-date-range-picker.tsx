"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/shared/lib/utils";
import {
    Button,
    FormField,
    Popover,
    PopoverContent,
    PopoverTrigger,
    FormItem,
    FormLabel,
    FormMessage, FormControl,
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

export function FormDateRangePicker({ control, name, title = "Діапазон дат (З - По)", className, trigger }: FormDateRangePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem className={cn(
                    "flex flex-col",
                    className
                )}>
                    <FormLabel className="text-base">{title}</FormLabel>
                    <FormControl>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full rounded-[5px] justify-start text-left font-normal",
                                            !field.value?.from && "text-muted-foreground",
                                            fieldState.error && "border-destructive focus-visible:ring-destructive"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {field.value?.from ? (
                                            field.value.to ? (
                                                <>
                                                    {format(field.value.from, "dd.MM.yyyy")} -{" "}
                                                    {format(field.value.to, "dd.MM.yyyy")}
                                                </>
                                            ) : (
                                                format(field.value.from, "dd.MM.yyyy")
                                            )
                                        ) : (
                                            <span>Оберіть діапазон</span>
                                        )}
                                    </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    locale={uk}
                                    selected={field.value as DateRange}
                                    onSelect={(range) => {
                                        field.onChange(range);
                                        // if (range?.from && range?.to) {
                                        //     setOpen(false);
                                        // }
                                        trigger?.();
                                    }}
                                    initialFocus
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
