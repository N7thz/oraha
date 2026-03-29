"use client"

import { useController, type Control } from "react-hook-form"

import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group"
import type { FormValues } from "../schema"

type AmountFieldProps = {
	control: Control<FormValues>
}

export function AmountField({ control }: AmountFieldProps) {
	const { field, fieldState } = useController({ control, name: "amount" })

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Valor</FieldLabel>
			<InputGroup>
				<InputGroupAddon>
					<InputGroupText>R$</InputGroupText>
				</InputGroupAddon>
				<InputGroupInput
					type="text"
					inputMode="decimal"
					placeholder="0,00"
					aria-invalid={!!fieldState.error}
					{...field}
					value={field.value ?? ""}
				/>
			</InputGroup>
			<FieldError errors={[fieldState.error]} />
		</Field>
	)
}
