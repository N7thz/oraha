"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { RepeatIcon } from "lucide-react"
import { useState } from "react"
import { useController, useForm } from "react-hook-form"
import { toast } from "sonner"

import { createRecurringTransaction } from "@/actions/recurring"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/components/transaction/schema"
import {
	recurringFormSchema,
	type RecurringFormValues,
} from "./schema"

function DayOfMonthField({
	control,
}: {
	control: ReturnType<typeof useForm<RecurringFormValues>>["control"]
}) {
	const { field, fieldState } = useController({ control, name: "dayOfMonth" })

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Dia do mês</FieldLabel>
			<Input
				type="number"
				min={1}
				max={31}
				placeholder="Ex: 5"
				aria-invalid={!!fieldState.error}
				{...field}
				value={field.value ?? ""}
				onChange={(e) => field.onChange(Number(e.target.value))}
			/>
			<FieldError errors={[fieldState.error]} />
		</Field>
	)
}

function CategoryField({
	control,
	type,
}: {
	control: ReturnType<typeof useForm<RecurringFormValues>>["control"]
	type: "INCOME" | "EXPENSE"
}) {
	const { field, fieldState } = useController({ control, name: "category" })
	const categories = type === "EXPENSE" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
	const label = type === "EXPENSE" ? "Despesas" : "Receitas"

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Categoria</FieldLabel>
			<Select value={field.value || ""} onValueChange={field.onChange}>
				<SelectTrigger className="w-full" aria-invalid={!!fieldState.error}>
					<SelectValue placeholder="Selecione..." />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectLabel>{label}</SelectLabel>
						{categories.map((cat) => (
							<SelectItem key={cat.value} value={cat.value}>
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

function AmountField({
	control,
}: {
	control: ReturnType<typeof useForm<RecurringFormValues>>["control"]
}) {
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

function DescriptionField({
	control,
}: {
	control: ReturnType<typeof useForm<RecurringFormValues>>["control"]
}) {
	const { field } = useController({ control, name: "description" })

	return (
		<Field>
			<FieldLabel>Descrição</FieldLabel>
			<Input placeholder="Ex: Aluguel mensal" {...field} value={field.value ?? ""} />
		</Field>
	)
}

function CustomCategoryField({
	control,
}: {
	control: ReturnType<typeof useForm<RecurringFormValues>>["control"]
}) {
	const { field, fieldState } = useController({
		control,
		name: "customCategory",
	})

	return (
		<Field data-invalid={!!fieldState.error}>
			<FieldLabel>Categoria personalizada</FieldLabel>
			<Input
				placeholder="Ex: Academia"
				aria-invalid={!!fieldState.error}
				{...field}
				value={field.value ?? ""}
			/>
			<FieldError errors={[fieldState.error]} />
		</Field>
	)
}

export function CreateRecurringDialog() {
	const [open, setOpen] = useState(false)
	const queryClient = useQueryClient()

	const { mutate, isPending } = useMutation({
		mutationFn: createRecurringTransaction,
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error)
				return
			}
			queryClient.invalidateQueries({ queryKey: ["recurring"] })
			toast.success("Transação recorrente criada!")
			setOpen(false)
		},
		onError: () => toast.error("Erro ao criar transação recorrente"),
	})

	const form = useForm<RecurringFormValues>({
		resolver: zodResolver(recurringFormSchema),
		defaultValues: {
			type: "EXPENSE",
			category: "" as never,
			amount: "",
			description: "",
			dayOfMonth: undefined,
		},
	})

	const type = form.watch("type")
	const category = form.watch("category")

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) form.reset()
		setOpen(isOpen)
	}

	function handleTypeChange(newType: "INCOME" | "EXPENSE") {
		form.setValue("type", newType)
		form.setValue("category", "" as never)
	}

	function onSubmit(values: RecurringFormValues) {
		mutate(values)
	}

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger render={<Button size="sm" />}>
				<RepeatIcon data-icon="inline-start" />
				Nova recorrente
			</AlertDialogTrigger>

			<AlertDialogContent>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<AlertDialogHeader>
						<AlertDialogTitle>Nova transação recorrente</AlertDialogTitle>
						<AlertDialogDescription>
							Transações recorrentes são lançadas automaticamente todo mês no dia
							configurado.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<FieldGroup className="my-4">
						<Field>
							<FieldLabel>Tipo</FieldLabel>
							<div className="flex gap-2">
								{(["EXPENSE", "INCOME"] as const).map((t) => (
									<Button
										key={t}
										type="button"
										size="sm"
										variant={type === t ? "default" : "outline"}
										className="flex-1"
										onClick={() => handleTypeChange(t)}
									>
										{t === "INCOME" ? "Receita" : "Despesa"}
									</Button>
								))}
							</div>
						</Field>
						<AmountField control={form.control} />
						<DescriptionField control={form.control} />
						<CategoryField control={form.control} type={type} />
						{category === "OTHER" && (
							<CustomCategoryField control={form.control} />
						)}
						<DayOfMonthField control={form.control} />
					</FieldGroup>

					<AlertDialogFooter>
						<AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
						<AlertDialogAction type="submit" disabled={isPending}>
							{isPending && <Spinner />}
							Salvar
						</AlertDialogAction>
					</AlertDialogFooter>
				</form>
			</AlertDialogContent>
		</AlertDialog>
	)
}
