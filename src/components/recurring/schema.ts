import { z } from "zod"

export const recurringFormSchema = z
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
			.refine(
				(v) => {
					const n = parseFloat(v.replace(",", "."))
					return !isNaN(n) && n > 0
				},
				{ message: "Valor deve ser maior que zero" },
			),
		description: z.string().optional(),
		dayOfMonth: z
			.number()
			.int()
			.min(1, { message: "Dia deve ser entre 1 e 31" })
			.max(31, { message: "Dia deve ser entre 1 e 31" }),
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

export type RecurringFormValues = z.infer<typeof recurringFormSchema>
