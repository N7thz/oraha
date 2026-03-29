"use client"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"

type TypeFieldProps = {
	value: "INCOME" | "EXPENSE"
	onChange: (type: "INCOME" | "EXPENSE") => void
}

export function TypeField({ value, onChange }: TypeFieldProps) {
	return (
		<Field>
			<FieldLabel>Tipo</FieldLabel>
			<div className="flex gap-2">
				{(["EXPENSE", "INCOME"] as const).map((t) => (
					<Button
						key={t}
						type="button"
						size="sm"
						variant={value === t ? "default" : "outline"}
						className="flex-1"
						onClick={() => onChange(t)}
					>
						{t === "INCOME" ? "Receita" : "Despesa"}
					</Button>
				))}
			</div>
		</Field>
	)
}
