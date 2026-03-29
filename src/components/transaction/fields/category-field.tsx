"use client"

import { useController, type Control } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	EXPENSE_CATEGORIES,
	INCOME_CATEGORIES,
	type FormValues,
} from "../schema"

type CategoryFieldProps = {
	control: Control<FormValues>
	type: "INCOME" | "EXPENSE"
}

export function CategoryField({ control, type }: CategoryFieldProps) {
	const { field, fieldState } = useController({ control, name: "category" })

	const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
	const label = type === "EXPENSE" ? "Despesas" : "Receitas"

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Categoria</FieldLabel>
			<Select
				value={field.value || ""}
				onValueChange={field.onChange}
			>
				<SelectTrigger
					className="w-full"
					aria-invalid={!!fieldState.error}
				>
					<SelectValue placeholder="Selecione..." />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>{label}</SelectLabel>
						{categories.map((cat) => (
							<SelectItem
								key={cat.value}
								value={cat.value}
							>
								{cat.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
			<FieldError errors={[fieldState.error]} />
		</Field>
	)
}
