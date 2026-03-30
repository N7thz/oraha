"use client"

import type { Table } from "@tanstack/react-table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ChevronDown, X } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

import { ALL_CATEGORIES, COLUMN_LABELS, type Transaction } from "./types"

type TransactionToolbarProps = {
	table: Table<Transaction>
	globalFilter: string
	onGlobalFilterChange: (value: string) => void
	typeFilter: string
	onTypeFilterChange: (value: string) => void
	categoryFilter: string
	onCategoryFilterChange: (value: string) => void
	dateRangeFilter: DateRange | undefined
	onDateRangeFilterChange: (range: DateRange | undefined) => void
}

export function TransactionToolbar({
	table,
	globalFilter,
	onGlobalFilterChange,
	typeFilter,
	onTypeFilterChange,
	categoryFilter,
	onCategoryFilterChange,
	dateRangeFilter,
	onDateRangeFilterChange,
}: TransactionToolbarProps) {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Input
				placeholder="Pesquisar por descrição ou categoria..."
				value={globalFilter}
				onChange={(e) => onGlobalFilterChange(e.target.value)}
				className="max-w-sm"
			/>

			<Select
				value={typeFilter || "ALL"}
				onValueChange={(v) => onTypeFilterChange(!v || v === "ALL" ? "" : v)}
			>
				<SelectTrigger className="w-36">
					<SelectValue placeholder="Tipo" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value="ALL">Todos</SelectItem>
						<SelectItem value="INCOME">Receita</SelectItem>
						<SelectItem value="EXPENSE">Despesa</SelectItem>
					</SelectGroup>
				</SelectContent>
			</Select>

			<Select
				value={categoryFilter || "ALL"}
				onValueChange={(v) => onCategoryFilterChange(!v || v === "ALL" ? "" : v)}
			>
				<SelectTrigger className="w-44">
					<SelectValue placeholder="Categoria" />
				</SelectTrigger>
				<SelectContent>
					<SelectGroup>
						<SelectItem value="ALL">Todas</SelectItem>
						{ALL_CATEGORIES.map((cat) => (
							<SelectItem key={cat.value} value={cat.value}>
								{cat.label}
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>

			<Popover>
				<PopoverTrigger
					render={
						<Button
							variant="outline"
							className={cn(
								"justify-start font-normal",
								!dateRangeFilter && "text-muted-foreground",
							)}
						/>
					}
				>
					<CalendarIcon data-icon="inline-start" />
					{dateRangeFilter?.from ? (
						dateRangeFilter.to ? (
							<>
								{format(dateRangeFilter.from, "dd/MM/yyyy")}
								{" – "}
								{format(dateRangeFilter.to, "dd/MM/yyyy")}
							</>
						) : (
							format(dateRangeFilter.from, "dd/MM/yyyy")
						)
					) : (
						"Período"
					)}
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0" align="start">
					<Calendar
						mode="range"
						selected={dateRangeFilter}
						onSelect={onDateRangeFilterChange}
						locale={ptBR}
						numberOfMonths={2}
					/>
				</PopoverContent>
			</Popover>

			{dateRangeFilter?.from && (
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onDateRangeFilterChange(undefined)}
					className="text-muted-foreground"
				>
					<X data-icon="inline-start" />
					Limpar período
				</Button>
			)}

			<DropdownMenu>
				<DropdownMenuTrigger
					render={
						<Button variant="outline" size="sm">
							Colunas <ChevronDown data-icon="inline-end" />
						</Button>
					}
				/>
				<DropdownMenuContent align="end">
					{table
						.getAllColumns()
						.filter((col) => col.getCanHide())
						.map((col) => (
							<DropdownMenuCheckboxItem
								key={col.id}
								checked={col.getIsVisible()}
								onCheckedChange={() => col.toggleVisibility(!col.getIsVisible())}
							>
								{COLUMN_LABELS[col.id] ?? col.id}
							</DropdownMenuCheckboxItem>
						))}
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}
