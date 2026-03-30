"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { endOfDay, format, startOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ArrowUpDown } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/money"
import { cn } from "@/lib/utils"

import { getCategoryLabel, type Transaction } from "./types"

export const columns: ColumnDef<Transaction>[] = [
	{
		accessorKey: "date",
		enableGlobalFilter: false,
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-2"
			>
				Data
				<ArrowUpDown data-icon="inline-end" />
			</Button>
		),
		cell: ({ row }) =>
			format(new Date(row.getValue("date")), "dd/MM/yyyy", { locale: ptBR }),
		sortingFn: "datetime",
		filterFn: (row, _id, value: DateRange) => {
			const txDate = new Date(row.getValue("date"))
			if (value.from && txDate < startOfDay(value.from)) return false
			if (value.to && txDate > endOfDay(value.to)) return false
			return true
		},
	},
	{
		accessorKey: "type",
		enableGlobalFilter: false,
		header: ({ column }) => (
			<Button
				variant="ghost"
				size="sm"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				className="-ml-2"
			>
				Tipo
				<ArrowUpDown data-icon="inline-end" />
			</Button>
		),
		cell: ({ row }) => {
			const type = row.getValue<string>("type")
			return (
				<Badge variant={type === "INCOME" ? "default" : "secondary"}>
					{type === "INCOME" ? "Receita" : "Despesa"}
				</Badge>
			)
		},
		filterFn: (row, _id, value) => row.original.type === value,
	},
	{
		accessorKey: "category",
		enableGlobalFilter: true,
		header: "Categoria",
		cell: ({ row }) =>
			getCategoryLabel(row.getValue("category"), row.original.customCategory),
		filterFn: (row, _id, value) => row.original.category === value,
	},
	{
		accessorKey: "description",
		enableGlobalFilter: true,
		header: "Descrição",
		cell: ({ row }) => (
			<span className="text-muted-foreground">{row.original.description ?? "—"}</span>
		),
	},
	{
		accessorKey: "amount",
		enableGlobalFilter: false,
		header: ({ column }) => (
			<div className="flex justify-end">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
					className="-mr-2"
				>
					Valor
					<ArrowUpDown data-icon="inline-end" />
				</Button>
			</div>
		),
		cell: ({ row }) => {
			const type = row.original.type
			const amount = row.original.amount
			return (
				<div className="text-right">
					<span
						className={cn(
							"font-medium",
							type === "INCOME" ? "text-green-600" : "text-red-500",
						)}
					>
						{type === "EXPENSE" ? "- " : "+ "}
						{formatBRL(amount / 100)}
					</span>
				</div>
			)
		},
	},
]
