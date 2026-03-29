"use client"

import { useController, type Control } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import type { FormValues } from "../schema"

type DescriptionFieldProps = {
	control: Control<FormValues>
}

export function DescriptionField({ control }: DescriptionFieldProps) {
	const { field } = useController({ control, name: "description" })

	return (
		<Field>
			<FieldLabel>
				Descrição{" "}
				<span className="font-normal text-muted-foreground">(opcional)</span>
			</FieldLabel>
			<Input
				type="text"
				placeholder="Ex: Almoço no restaurante"
				{...field}
				value={field.value ?? ""}
			/>
		</Field>
	)
}
