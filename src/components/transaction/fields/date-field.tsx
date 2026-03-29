"use client"

import { useState } from "react"
import { useController, type Control } from "react-hook-form"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { FormValues } from "../schema"

type DateFieldProps = {
	control: Control<FormValues>
}

export function DateField({ control }: DateFieldProps) {
	const [open, setOpen] = useState(false)
	const { field, fieldState } = useController({ control, name: "date" })

	const selectedDate = field.value
		? parse(field.value, "yyyy-MM-dd", new Date())
		: undefined

	function handleSelect(date: Date | undefined) {
		if (!date) return
		field.onChange(format(date, "yyyy-MM-dd"))
		setOpen(false)
	}

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Data</FieldLabel>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger
					render={
						<Button
							variant="outline"
							aria-invalid={!!fieldState.error}
							className={cn(
								"w-full justify-start font-normal",
								!field.value && "text-muted-foreground",
							)}
						/>
					}
				>
					<CalendarIcon data-icon="inline-start" />
					{selectedDate
						? format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
						: "Selecione uma data"}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="single"
						selected={selectedDate}
						onSelect={handleSelect}
						locale={ptBR}
					/>
				</PopoverContent>
			</Popover>
			<FieldError errors={[fieldState.error]} />
		</Field>
	)
}
