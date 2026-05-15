"use client"

import { useRef, useState } from "react"
import {
	AlertTriangleIcon,
	CheckCircle2Icon,
	DownloadIcon,
	FileSpreadsheetIcon,
	InfoIcon,
	UploadIcon,
	XIcon,
} from "lucide-react"
import { toast } from "sonner"
import * as XLSX from "xlsx"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { importTransactions, type ImportRow } from "@/actions/transaction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet"
import { formatBRL } from "@/lib/money"

type ParsedRow = ImportRow & { _line: number; _error?: string }

const CATEGORY_MAP: Record<string, string> = {
	alimentacao: "FOOD",
	alimentação: "FOOD",
	comida: "FOOD",
	transporte: "TRANSPORT",
	saude: "HEALTH",
	saúde: "HEALTH",
	educacao: "EDUCATION",
	educação: "EDUCATION",
	entretenimento: "ENTERTAINMENT",
	lazer: "ENTERTAINMENT",
	moradia: "HOUSING",
	aluguel: "HOUSING",
	vestuario: "CLOTHING",
	vestuário: "CLOTHING",
	roupa: "CLOTHING",
	roupas: "CLOTHING",
	contas: "UTILITIES",
	utilidades: "UTILITIES",
	salario: "SALARY",
	salário: "SALARY",
	investimento: "INVESTMENT",
	investimentos: "INVESTMENT",
	outro: "OTHER",
	outros: "OTHER",
	other: "OTHER",
}

function normalizeDate(raw: string | number): string | null {
	if (typeof raw === "number") {
		const date = XLSX.SSF.parse_date_code(raw)
		if (!date) return null
		const y = date.y
		const m = String(date.m).padStart(2, "0")
		const d = String(date.d).padStart(2, "0")
		return `${y}-${m}-${d}`
	}
	const str = String(raw).trim()
	const ddmmyyyy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
	if (ddmmyyyy) {
		const [, d, m, y] = ddmmyyyy
		return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`
	}
	const yyyymmdd = str.match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/)
	if (yyyymmdd) return str.replace(/\//g, "-")
	return null
}

function parseRows(
	sheet: XLSX.WorkSheet,
): { valid: ParsedRow[]; invalid: ParsedRow[] } {
	const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
		defval: "",
	})

	const valid: ParsedRow[] = []
	const invalid: ParsedRow[] = []

	raw.forEach((row, i) => {
		const line = i + 2
		const keys = Object.keys(row).map((k) => k.toLowerCase().trim())
		const get = (names: string[]) => {
			const key = Object.keys(row).find((k) =>
				names.includes(k.toLowerCase().trim()),
			)
			return key ? String(row[key] ?? "").trim() : ""
		}
		const getRaw = (names: string[]) => {
			const key = Object.keys(row).find((k) =>
				names.includes(k.toLowerCase().trim()),
			)
			return key ? row[key] : undefined
		}

		const rawDate = getRaw(["data", "date"])
		const date = normalizeDate(
			typeof rawDate === "number" ? rawDate : String(rawDate ?? ""),
		)
		const tipoRaw = get(["tipo", "type"]).toLowerCase()
		const type: "INCOME" | "EXPENSE" =
			tipoRaw === "receita" || tipoRaw === "income" ? "INCOME" : "EXPENSE"
		const categoryRaw = get(["categoria", "category"]).toLowerCase()
		const mappedCategory = CATEGORY_MAP[categoryRaw]
		const category = mappedCategory ?? "OTHER"
		const customCategory =
			!mappedCategory && categoryRaw ? categoryRaw : undefined
		const amountRaw = get(["valor", "value", "amount"]).replace(",", ".")
		const amount = parseFloat(amountRaw)
		const description = get(["descricao", "descrição", "description", "obs"])

		const errors: string[] = []
		if (!date) errors.push("data inválida")
		if (!tipoRaw) errors.push("tipo ausente")
		if (isNaN(amount) || amount <= 0) errors.push("valor inválido")

		const parsed: ParsedRow = {
			_line: line,
			date: date ?? "",
			type,
			category,
			customCategory,
			amount,
			description: description || undefined,
			_error: errors.length ? errors.join(", ") : undefined,
		}

		if (errors.length) invalid.push(parsed)
		else valid.push(parsed)
	})

	return { valid, invalid }
}

function downloadTemplate() {
	const wb = XLSX.utils.book_new()
	const ws = XLSX.utils.aoa_to_sheet([
		["data", "tipo", "categoria", "valor", "descricao"],
		["15/01/2025", "despesa", "alimentacao", 50.0, "Almoço restaurante"],
		["16/01/2025", "receita", "salario", 6800.0, "Salário mensal"],
		["20/01/2025", "despesa", "moradia", 1500.0, "Aluguel"],
		["22/01/2025", "despesa", "transporte", 120.5, "Combustível"],
	])
	ws["!cols"] = [{ wch: 14 }, { wch: 10 }, { wch: 16 }, { wch: 10 }, { wch: 24 }]
	XLSX.utils.book_append_sheet(wb, ws, "Transações")
	XLSX.writeFile(wb, "modelo-oraha.xlsx")
}

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type Step = "upload" | "preview"

export function ImportSpreadsheetButton() {
	const [open, setOpen] = useState(false)
	const [step, setStep] = useState<Step>("upload")
	const [file, setFile] = useState<File | null>(null)
	const [parsed, setParsed] = useState<{
		valid: ParsedRow[]
		invalid: ParsedRow[]
	} | null>(null)
	const inputRef = useRef<HTMLInputElement>(null)
	const queryClient = useQueryClient()

	const { mutate, isPending } = useMutation({
		mutationFn: importTransactions,
		onSuccess: (result) => {
			if (!result.success) {
				toast.error(result.error)
				return
			}
			queryClient.invalidateQueries({ queryKey: ["transactions"] })
			queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
			queryClient.invalidateQueries({ queryKey: ["monthly-chart"] })
			queryClient.invalidateQueries({ queryKey: ["category-chart"] })
			toast.success(
				`${result.count} transaç${result.count === 1 ? "ão importada" : "ões importadas"} com sucesso!`,
			)
			handleClose()
		},
		onError: () => toast.error("Erro ao importar transações"),
	})

	function handleClose() {
		setOpen(false)
		setStep("upload")
		setFile(null)
		setParsed(null)
	}

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = e.target.files?.[0]
		e.target.value = ""
		if (!selected) return

		setFile(selected)

		const buffer = await selected.arrayBuffer()
		const wb = XLSX.read(buffer, { type: "array", cellDates: false })
		const ws = wb.Sheets[wb.SheetNames[0]]
		const result = parseRows(ws)
		setParsed(result)
		setStep("preview")
	}

	function handleImport() {
		if (!parsed?.valid.length) return
		mutate(parsed.valid)
	}

	return (
		<Sheet open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
			<SheetTrigger render={<Button variant="outline" />}>
				<UploadIcon data-icon="inline-start" />
				Importar planilha
			</SheetTrigger>

			<SheetContent className="flex flex-col gap-0 overflow-y-auto">
				<SheetHeader>
					<SheetTitle>Importar transações</SheetTitle>
					<SheetDescription>
						Importe transações a partir de uma planilha .xlsx ou .csv.
					</SheetDescription>
				</SheetHeader>

				{step === "upload" && (
					<div className="flex flex-col gap-4 px-4 py-2">
						{/* Format documentation */}
						<div className="rounded-lg border border-border bg-muted/40 p-4">
							<div className="mb-2 flex items-center gap-2 text-sm font-medium">
								<InfoIcon className="size-4 text-primary" />
								Formato esperado da planilha
							</div>
							<p className="mb-3 text-xs text-muted-foreground">
								A planilha deve conter as seguintes colunas na primeira linha:
							</p>
							<div className="overflow-x-auto rounded border border-border">
								<table className="w-full text-xs">
									<thead>
										<tr className="border-b border-border bg-muted/60">
											{["data", "tipo", "categoria", "valor", "descricao"].map(
												(h) => (
													<th
														key={h}
														className="px-2 py-1.5 text-left font-mono font-medium"
													>
														{h}
													</th>
												),
											)}
										</tr>
									</thead>
									<tbody>
										<tr className="border-b border-border">
											<td className="px-2 py-1.5 font-mono">15/01/2025</td>
											<td className="px-2 py-1.5 font-mono">despesa</td>
											<td className="px-2 py-1.5 font-mono">alimentacao</td>
											<td className="px-2 py-1.5 font-mono">50.00</td>
											<td className="px-2 py-1.5 font-mono text-muted-foreground">
												Almoço
											</td>
										</tr>
										<tr>
											<td className="px-2 py-1.5 font-mono">16/01/2025</td>
											<td className="px-2 py-1.5 font-mono">receita</td>
											<td className="px-2 py-1.5 font-mono">salario</td>
											<td className="px-2 py-1.5 font-mono">6800.00</td>
											<td className="px-2 py-1.5 font-mono text-muted-foreground">
												Salário
											</td>
										</tr>
									</tbody>
								</table>
							</div>

							<div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
								<p>
									<strong className="text-foreground">data:</strong>{" "}
									dd/mm/aaaa ou aaaa-mm-dd
								</p>
								<p>
									<strong className="text-foreground">tipo:</strong> receita ou
									despesa
								</p>
								<p>
									<strong className="text-foreground">categoria:</strong>{" "}
									alimentacao, transporte, saude, educacao, entretenimento,
									moradia, vestuario, contas, salario, investimento, outro
								</p>
								<p>
									<strong className="text-foreground">valor:</strong> número
									decimal (ex: 50.00 ou 50,00)
								</p>
								<p>
									<strong className="text-foreground">descricao:</strong>{" "}
									opcional
								</p>
							</div>

							<Button
								variant="outline"
								size="sm"
								className="mt-3 w-full"
								onClick={downloadTemplate}
								type="button"
							>
								<DownloadIcon className="size-3.5" />
								Baixar modelo .xlsx
							</Button>
						</div>

						{/* Drop zone */}
						<div
							className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-muted/30"
							onClick={() => inputRef.current?.click()}
						>
							<UploadIcon className="size-6" />
							<span>Clique para selecionar arquivo</span>
							<span className="text-xs">.xlsx ou .csv</span>
							<input
								ref={inputRef}
								type="file"
								accept=".xlsx,.csv"
								className="hidden"
								onChange={handleFileChange}
							/>
						</div>
					</div>
				)}

				{step === "preview" && parsed && (
					<div className="flex flex-col gap-4 px-4 py-2">
						{/* File info */}
						{file && (
							<div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
								<FileSpreadsheetIcon className="size-4 shrink-0 text-primary" />
								<span className="flex-1 truncate">{file.name}</span>
								<span className="text-xs text-muted-foreground">
									{formatFileSize(file.size)}
								</span>
								<Button
									variant="ghost"
									size="icon-sm"
									onClick={() => setStep("upload")}
									type="button"
								>
									<XIcon className="size-4" />
								</Button>
							</div>
						)}

						{/* Summary badges */}
						<div className="flex gap-2">
							<Badge
								variant="secondary"
								className="gap-1.5 text-xs"
								style={{ color: "hsl(142 71% 45%)" }}
							>
								<CheckCircle2Icon className="size-3" />
								{parsed.valid.length} válida
								{parsed.valid.length !== 1 ? "s" : ""}
							</Badge>
							{parsed.invalid.length > 0 && (
								<Badge
									variant="secondary"
									className="gap-1.5 text-xs text-destructive"
								>
									<AlertTriangleIcon className="size-3" />
									{parsed.invalid.length} com erro
								</Badge>
							)}
						</div>

						{/* Valid preview */}
						{parsed.valid.length > 0 && (
							<div>
								<p className="mb-1.5 text-xs font-medium text-muted-foreground">
									Serão importadas
								</p>
								<div className="max-h-56 overflow-y-auto rounded-lg border border-border">
									<table className="w-full text-xs">
										<thead className="sticky top-0 bg-muted/80">
											<tr>
												{["Data", "Tipo", "Valor", "Descrição"].map((h) => (
													<th
														key={h}
														className="border-b border-border px-2 py-1.5 text-left font-medium"
													>
														{h}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{parsed.valid.map((row) => (
												<tr
													key={row._line}
													className="border-b border-border/50 last:border-0"
												>
													<td className="px-2 py-1.5 font-mono">
														{row.date}
													</td>
													<td className="px-2 py-1.5">
														<span
															style={{
																color:
																	row.type === "INCOME"
																		? "hsl(142 71% 45%)"
																		: "hsl(0 72% 51%)",
															}}
														>
															{row.type === "INCOME"
																? "Receita"
																: "Despesa"}
														</span>
													</td>
													<td className="px-2 py-1.5 font-mono tabular-nums">
														{formatBRL(row.amount)}
													</td>
													<td className="px-2 py-1.5 text-muted-foreground max-w-[120px] truncate">
														{row.description ?? "—"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Invalid rows */}
						{parsed.invalid.length > 0 && (
							<div>
								<p className="mb-1.5 text-xs font-medium text-destructive">
									Linhas ignoradas (com erro)
								</p>
								<div className="max-h-32 overflow-y-auto rounded-lg border border-destructive/30 bg-destructive/5">
									{parsed.invalid.map((row) => (
										<div
											key={row._line}
											className="border-b border-destructive/20 px-3 py-1.5 text-xs last:border-0"
										>
											<span className="font-medium">Linha {row._line}:</span>{" "}
											<span className="text-muted-foreground">
												{row._error}
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				<SheetFooter className="mt-auto">
					<Button variant="outline" onClick={handleClose} type="button">
						Cancelar
					</Button>
					{step === "preview" && (
						<Button
							disabled={!parsed?.valid.length || isPending}
							onClick={handleImport}
							type="button"
						>
							{isPending
								? "Importando..."
								: `Importar ${parsed?.valid.length ?? 0} transaç${(parsed?.valid.length ?? 0) === 1 ? "ão" : "ões"}`}
						</Button>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
