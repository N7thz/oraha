"use client"

import {
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { DateRange } from "react-day-picker"

import { getTransactions } from "@/actions/transaction"
import { Skeleton } from "@/components/ui/skeleton"

import { columns } from "./columns"
import { TransactionPagination } from "./transaction-pagination"
import { TransactionTable } from "./transaction-table"
import { TransactionToolbar } from "./transaction-toolbar"
import { getCategoryLabel } from "./types"

export function TransactionList() {
	const [globalFilter, setGlobalFilter] = useState("")
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

	const { data: transactions = [], isLoading } = useQuery({
		queryKey: ["transactions"],
		queryFn: () => getTransactions(),
	})

	const table = useReactTable({
		data: transactions,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onGlobalFilterChange: setGlobalFilter,
		globalFilterFn: (row, columnId, filterValue) => {
			const search = String(filterValue).toLowerCase()
			const tx = row.original
			if (columnId === "description") {
				return tx.description?.toLowerCase().includes(search) ?? false
			}
			if (columnId === "category") {
				return getCategoryLabel(tx.category, tx.customCategory)
					.toLowerCase()
					.includes(search)
			}
			return false
		},
		state: { sorting, columnFilters, columnVisibility, globalFilter },
		initialState: { pagination: { pageSize: 20 } },
		autoResetPageIndex: true,
	})

	const typeFilter = (columnFilters.find((f) => f.id === "type")?.value as string) ?? ""
	const categoryFilter = (columnFilters.find((f) => f.id === "category")?.value as string) ?? ""
	const dateRangeFilter = columnFilters.find((f) => f.id === "date")?.value as DateRange | undefined

	function setTypeFilter(value: string) {
		setColumnFilters((prev) => {
			const rest = prev.filter((f) => f.id !== "type")
			return value ? [...rest, { id: "type", value }] : rest
		})
	}

	function setCategoryFilter(value: string) {
		setColumnFilters((prev) => {
			const rest = prev.filter((f) => f.id !== "category")
			return value ? [...rest, { id: "category", value }] : rest
		})
	}

	function setDateRangeFilter(range: DateRange | undefined) {
		setColumnFilters((prev) => {
			const rest = prev.filter((f) => f.id !== "date")
			return range?.from ? [...rest, { id: "date", value: range }] : rest
		})
	}

	if (isLoading) {
		return (
			<div className="flex flex-col gap-2">
				{Array.from({ length: 8 }).map((_, i) => (
					<Skeleton key={i} className="h-12 rounded-lg" />
				))}
			</div>
		)
	}

	return (
		<div className="flex flex-col gap-4">
			<TransactionToolbar
				table={table}
				globalFilter={globalFilter}
				onGlobalFilterChange={setGlobalFilter}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
				categoryFilter={categoryFilter}
				onCategoryFilterChange={setCategoryFilter}
				dateRangeFilter={dateRangeFilter}
				onDateRangeFilterChange={setDateRangeFilter}
			/>
			<TransactionTable table={table} columnCount={columns.length} />
			<TransactionPagination table={table} />
		</div>
	)
}
