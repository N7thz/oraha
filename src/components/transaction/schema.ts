import { z } from "zod"

export const EXPENSE_CATEGORIES = [
	{ value: "FOOD", label: "Alimentação" },
	{ value: "TRANSPORT", label: "Transporte" },
	{ value: "HEALTH", label: "Saúde" },
	{ value: "EDUCATION", label: "Educação" },
	{ value: "ENTERTAINMENT", label: "Entretenimento" },
	{ value: "HOUSING", label: "Moradia" },
	{ value: "CLOTHING", label: "Vestuário" },
	{ value: "UTILITIES", label: "Contas/Utilidades" },
	{ value: "OTHER", label: "Outro" },
] as const

export const INCOME_CATEGORIES = [
	{ value: "SALARY", label: "Salário" },
	{ value: "INVESTMENT", label: "Investimento" },
	{ value: "OTHER", label: "Outro" },
] as const

export const formSchema = z
	.object({
		type: z.enum(["INCOME", "EXPENSE"]),
		category: z.enum([
			"FOOD",
			"TRANSPORT",
			"HEALTH",
			"EDUCATION",
			"ENTERTAINMENT",
			"HOUSING",
			"CLOTHING",
			"UTILITIES",
			"SALARY",
			"INVESTMENT",
			"OTHER",
		]),
		customCategory: z.string().optional(),
		amount: z
			.string()
			.min(1, { message: "Valor é obrigatório" })
			.refine((v) => {
				const n = parseFloat(v.replace(",", "."))
				return !isNaN(n) && n > 0
			}, { message: "Valor deve ser maior que zero" }),
		description: z.string().optional(),
		date: z.string().min(1, { message: "Data é obrigatória" }),
	})
	.refine(
		(data) =>
			data.category !== "OTHER" ||
			(data.customCategory && data.customCategory.trim().length > 0),
		{
			message: "Informe a categoria personalizada",
			path: ["customCategory"],
		},
	)

export type FormValues = z.infer<typeof formSchema>
