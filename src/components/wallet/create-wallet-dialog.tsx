"use client"

import { useState } from "react"
import { useForm, useController } from "react-hook-form"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@/components/ui/input-group"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { createWallet } from "@/actions/wallet"
import { walletFormSchema, WALLET_TYPES, type WalletFormValues } from "./schema"

export function CreateWalletDialog() {
	const [open, setOpen] = useState(false)
	const queryClient = useQueryClient()

	const form = useForm<WalletFormValues>({
		resolver: zodResolver(walletFormSchema),
		defaultValues: {
			name: "",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			type: "" as any,
			balance: "",
		},
	})

	const nameField = useController({ control: form.control, name: "name" })
	const typeField = useController({ control: form.control, name: "type" })
	const balanceField = useController({ control: form.control, name: "balance" })

	const { mutate, isPending } = useMutation({
		mutationFn: createWallet,
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error)
				return
			}
			queryClient.invalidateQueries({ queryKey: ["wallets"] })
			toast.success("Carteira criada com sucesso!")
			setOpen(false)
		},
		onError: () => {
			toast.error("Erro ao criar carteira")
		},
	})

	function handleOpenChange(isOpen: boolean) {
		if (!isOpen) form.reset()
		setOpen(isOpen)
	}

	function onSubmit(values: WalletFormValues) {
		mutate(values)
	}

	return (
		<AlertDialog open={open} onOpenChange={handleOpenChange}>
			<AlertDialogTrigger render={<Button size="sm" />}>
				<PlusIcon data-icon="inline-start" />
				Nova carteira
			</AlertDialogTrigger>

			<AlertDialogContent>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<AlertDialogHeader>
						<AlertDialogTitle>Nova carteira</AlertDialogTitle>
						<AlertDialogDescription>
							Adicione uma conta, cartão ou carteira
						</AlertDialogDescription>
					</AlertDialogHeader>

					<FieldGroup className="my-4">
						<Field data-invalid={!!nameField.fieldState.error}>
							<FieldLabel>Nome</FieldLabel>
							<Input
								placeholder="Ex: Nubank, Carteira..."
								aria-invalid={!!nameField.fieldState.error}
								{...nameField.field}
							/>
							<FieldError errors={[nameField.fieldState.error]} />
						</Field>

						<Field data-invalid={!!typeField.fieldState.error}>
							<FieldLabel>Tipo</FieldLabel>
							<Select
								value={typeField.field.value || ""}
								onValueChange={typeField.field.onChange}
							>
								<SelectTrigger aria-invalid={!!typeField.fieldState.error}>
									<SelectValue placeholder="Selecione o tipo" />
								</SelectTrigger>
								<SelectContent>
									{WALLET_TYPES.map((t) => (
										<SelectItem key={t.value} value={t.value}>
											{t.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<FieldError errors={[typeField.fieldState.error]} />
						</Field>

						<Field data-invalid={!!balanceField.fieldState.error}>
							<FieldLabel>Saldo inicial</FieldLabel>
							<InputGroup>
								<InputGroupAddon>
									<InputGroupText>R$</InputGroupText>
								</InputGroupAddon>
								<InputGroupInput
									type="text"
									inputMode="decimal"
									placeholder="0,00"
									aria-invalid={!!balanceField.fieldState.error}
									{...balanceField.field}
									value={balanceField.field.value ?? ""}
								/>
							</InputGroup>
							<FieldError errors={[balanceField.fieldState.error]} />
						</Field>
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
