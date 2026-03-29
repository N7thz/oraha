"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

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
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { createTransaction } from "@/actions/transaction"
import { formSchema, type FormValues } from "@/components/transaction/schema"
import { TypeField } from "@/components/transaction/fields/type-field"
import { AmountField } from "@/components/transaction/fields/amount-field"
import { DescriptionField } from "@/components/transaction/fields/description-field"
import { CategoryField } from "@/components/transaction/fields/category-field"
import { CustomCategoryField } from "@/components/transaction/fields/custom-category-field"
import { DateField } from "@/components/transaction/fields/date-field"

export function CreateTransactionDialog() {
	const [open, setOpen] = useState(false)
	const queryClient = useQueryClient()

	const { mutate, isPending } = useMutation({
		mutationFn: createTransaction,
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error)
				return
			}
			queryClient.invalidateQueries({ queryKey: ["transactions"] })
			toast.success("Transação criada com sucesso!")
			setOpen(false)
		},
		onError: () => {
			toast.error("Erro ao criar transação")
		},
	})

	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			type: "EXPENSE",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			category: "" as any,
			amount: "",
			description: "",
			date: new Date().toISOString().split("T")[0],
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		form.setValue("category", "" as any)
	}

	function onSubmit(values: FormValues) {
		mutate(values)
	}

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger render={<Button size="sm" />}>
				<PlusIcon data-icon="inline-start" />
				Nova transação
			</AlertDialogTrigger>

			<AlertDialogContent>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<AlertDialogHeader>
						<AlertDialogTitle>Nova transação</AlertDialogTitle>
						<AlertDialogDescription>
							Cadastre uma nova receita ou despesa
						</AlertDialogDescription>
					</AlertDialogHeader>

					<FieldGroup className="my-4">
						<TypeField value={type} onChange={handleTypeChange} />
						<AmountField control={form.control} />
						<DescriptionField control={form.control} />
						<CategoryField control={form.control} type={type} />
						{category === "OTHER" && (
							<CustomCategoryField control={form.control} />
						)}
						<DateField control={form.control} />
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
