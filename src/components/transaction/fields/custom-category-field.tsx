"use client"

import { useController, type Control } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import type { FormValues } from "../schema"

type CustomCategoryFieldProps = {
	control: Control<FormValues>
}

export function CustomCategoryField({ control }: CustomCategoryFieldProps) {
	const { field, fieldState } = useController({
		control,
		name: "customCategory",
	})

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Categoria personalizada</FieldLabel>
			<Input
				type="text"
				placeholder="Ex: Presente"
				aria-invalid={!!fieldState.error}
				{...field}
				value={field.value ?? ""}
			/>
			<FieldError errors={[fieldState.error]} />
		</Field>
	)
}
