import { z } from "zod"

export const WALLET_TYPES = [
	{ value: "CHECKING", label: "Conta Corrente" },
	{ value: "SAVINGS", label: "Poupança" },
	{ value: "CREDIT_CARD", label: "Cartão de Crédito" },
	{ value: "CASH", label: "Dinheiro" },
	{ value: "INVESTMENT", label: "Investimento" },
	{ value: "PIX", label: "Pix" },
] as const

export const walletFormSchema = z.object({
	name: z.string().min(1, { message: "Nome é obrigatório" }),
	type: z.enum(["CHECKING", "SAVINGS", "CREDIT_CARD", "CASH", "INVESTMENT", "PIX"]),
	balance: z
		.string()
		.optional()
		.refine(
			(v) => {
				if (!v || v === "") return true
				const n = parseFloat(v.replace(",", "."))
				return !isNaN(n) && n >= 0
			},
			{ message: "Saldo deve ser maior ou igual a zero" },
		),
})

export type WalletFormValues = z.infer<typeof walletFormSchema>
