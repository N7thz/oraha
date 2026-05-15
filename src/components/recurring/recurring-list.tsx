"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	ArrowDownIcon,
	ArrowUpIcon,
	CalendarIcon,
	PauseIcon,
	PlayIcon,
	Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import {
	deleteRecurringTransaction,
	getRecurringTransactions,
	toggleRecurringTransaction,
} from "@/actions/recurring"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/components/transaction/schema"
import { formatBRL } from "@/lib/money"

function getCategoryLabel(category: string, customCategory?: string | null) {
	if (category === "OTHER" && customCategory) return customCategory
	const all = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]
	return all.find((c) => c.value === category)?.label ?? category
}

function ordinal(day: number) {
	return `dia ${day}`
}

export function RecurringList() {
	const queryClient = useQueryClient()

	const { data: recurring, isLoading } = useQuery({
		queryKey: ["recurring"],
		queryFn: getRecurringTransactions,
	})

	const { mutate: toggle, isPending: isToggling } = useMutation({
		mutationFn: toggleRecurringTransaction,
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error)
				return
			}
			queryClient.invalidateQueries({ queryKey: ["recurring"] })
		},
		onError: () => toast.error("Erro ao atualizar"),
	})

	const { mutate: remove, isPending: isRemoving } = useMutation({
		mutationFn: deleteRecurringTransaction,
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error)
				return
			}
			queryClient.invalidateQueries({ queryKey: ["recurring"] })
			toast.success("Transação recorrente removida")
		},
		onError: () => toast.error("Erro ao remover"),
	})

	if (isLoading) {
		return (
			<div className="flex flex-col gap-3">
				{Array.from({ length: 4 }).map((_, i) => (
					<Skeleton key={i} className="h-20 rounded-xl" />
				))}
			</div>
		)
	}

	if (!recurring?.length) {
		return (
			<p className="text-sm text-muted-foreground">
				Nenhuma transação recorrente cadastrada.
			</p>
		)
	}

	return (
		<div className="flex flex-col gap-3">
			{recurring.map((item) => {
				const isIncome = item.type === "INCOME"
				const Icon = isIncome ? ArrowUpIcon : ArrowDownIcon

				return (
					<Card key={item.id} className="opacity-100 data-[inactive=true]:opacity-60" data-inactive={!item.active}>
						<CardContent className="flex items-center gap-4">
							<div
								className="flex size-9 shrink-0 items-center justify-center rounded-full"
								style={{
									background: isIncome
										? "hsl(142 71% 45% / 0.15)"
										: "hsl(0 72% 51% / 0.15)",
								}}
							>
								<Icon
									className="size-4"
									style={{
										color: isIncome
											? "hsl(142 71% 45%)"
											: "hsl(0 72% 51%)",
									}}
								/>
							</div>

							<div className="flex flex-1 flex-col gap-0.5 min-w-0">
								<div className="flex items-center gap-2">
									<span className="truncate font-medium text-sm">
										{item.description ||
											getCategoryLabel(
												item.category,
												item.customCategory,
											)}
									</span>
									{!item.active && (
										<Badge variant="secondary" className="shrink-0 text-xs">
											Pausada
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-3 text-xs text-muted-foreground">
									<span>
										{getCategoryLabel(item.category, item.customCategory)}
									</span>
									<span className="flex items-center gap-1">
										<CalendarIcon className="size-3" />
										Todo mês, {ordinal(item.dayOfMonth)}
									</span>
								</div>
							</div>

							<span
								className="shrink-0 font-semibold tabular-nums"
								style={{
									color: isIncome
										? "hsl(142 71% 45%)"
										: "hsl(0 72% 51%)",
								}}
							>
								{isIncome ? "+" : "-"}
								{formatBRL(Number(item.amount))}
							</span>

							<div className="flex shrink-0 items-center gap-1">
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => toggle(item.id)}
									disabled={isToggling}
									aria-label={item.active ? "Pausar" : "Ativar"}
								>
									{item.active ? (
										<PauseIcon className="size-4" />
									) : (
										<PlayIcon className="size-4" />
									)}
								</Button>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => remove(item.id)}
									disabled={isRemoving}
									aria-label="Remover"
									className="text-destructive hover:text-destructive"
								>
									<Trash2Icon className="size-4" />
								</Button>
							</div>
						</CardContent>
					</Card>
				)
			})}
		</div>
	)
}
