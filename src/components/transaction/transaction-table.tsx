"use client"

import { flexRender, type Table } from "@tanstack/react-table"

import {
	Table as UITable,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"

import type { Transaction } from "./types"

type TransactionTableProps = {
	table: Table<Transaction>
	columnCount: number
}

export function TransactionTable({ table, columnCount }: TransactionTableProps) {
	return (
		<div className="overflow-hidden rounded-lg border">
			<UITable>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={columnCount}
								className="h-24 text-center text-muted-foreground"
							>
								Nenhuma transação encontrada.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</UITable>
		</div>
	)
}
