"use client"

import type { Table } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

import type { Transaction } from "./types"

type TransactionPaginationProps = {
	table: Table<Transaction>
}

export function TransactionPagination({ table }: TransactionPaginationProps) {
	return (
		<div className="flex items-center justify-between text-sm text-muted-foreground">
			<span>
				{table.getFilteredRowModel().rows.length} transação(ões) encontrada(s)
			</span>

			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="whitespace-nowrap">Linhas por página</span>
					<Select
						value={String(table.getState().pagination.pageSize)}
						onValueChange={(v) => v && table.setPageSize(Number(v))}
					>
						<SelectTrigger className="w-16" size="sm">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{[10, 20, 50, 100, 500].map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						Anterior
					</Button>
					<span className="whitespace-nowrap">
						Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Próxima
					</Button>
				</div>
			</div>
		</div>
	)
}
