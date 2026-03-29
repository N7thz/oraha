"use client"

import { useRef, useState } from "react"
import { FileSpreadsheetIcon, UploadIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
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

function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ImportSpreadsheetButton() {
	const [open, setOpen] = useState(false)
	const [files, setFiles] = useState<File[]>([])
	const [importing, setImporting] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const selected = Array.from(e.target.files ?? [])
		setFiles((prev) => {
			const existing = new Set(prev.map((f) => f.name))
			return [...prev, ...selected.filter((f) => !existing.has(f.name))]
		})
		e.target.value = ""
	}

	function removeFile(name: string) {
		setFiles((prev) => prev.filter((f) => f.name !== name))
	}

	async function handleImport() {
		if (!files.length) return

		setImporting(true)

		try {
			// TODO: implementar lógica de importação
			await new Promise((resolve) => setTimeout(resolve, 1000))
			toast.success(
				`${files.length} planilha${files.length > 1 ? "s" : ""} importada${files.length > 1 ? "s" : ""} com sucesso.`,
			)
			setFiles([])
			setOpen(false)
		} catch {
			toast.error("Erro ao importar planilhas.")
		} finally {
			setImporting(false)
		}
	}

	return (
		<Sheet
			open={open}
			onOpenChange={setOpen}
		>
			<SheetTrigger render={<Button variant="outline" />}>
				<UploadIcon data-icon="inline-start" />
				Importar planilha
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Importar planilhas de gastos</SheetTitle>
					<SheetDescription>
						Selecione um ou mais arquivos .xlsx ou .csv.
					</SheetDescription>
				</SheetHeader>
				<div className="flex flex-col gap-3 px-4">
					<div
						className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border p-8 text-sm text-muted-foreground transition-colors hover:border-ring hover:bg-muted/30"
						onClick={() => inputRef.current?.click()}
					>
						<UploadIcon className="size-6" />
						<span>Clique para selecionar arquivos</span>
						<span className="text-xs">.xlsx ou .csv</span>
						<input
							ref={inputRef}
							type="file"
							accept=".xlsx,.csv"
							multiple
							className="hidden"
							onChange={handleFileChange}
						/>
					</div>
					{files.length > 0 && (
						<ul className="flex flex-col gap-1.5">
							{files.map((file) => (
								<li
									key={file.name}
									className="flex items-center gap-3 rounded-md border border-border bg-linear-to-br from-muted/60 to-transparent px-3 py-2 text-sm"
								>
									<FileSpreadsheetIcon className="size-4 shrink-0 text-primary" />
									<div className="flex min-w-0 flex-1 flex-col">
										<span className="truncate text-foreground">
											{file.name}
										</span>
										<span className="text-xs text-muted-foreground">
											{formatFileSize(file.size)}
										</span>
									</div>
									<Button
										variant="ghost"
										size="icon-sm"
										onClick={() => removeFile(file.name)}
										aria-label={`Remover ${file.name}`}
									>
										<XIcon />
									</Button>
								</li>
							))}
						</ul>
					)}
				</div>
				<SheetFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
					>
						Cancelar
					</Button>
					<Button
						disabled={!files.length || importing}
						onClick={handleImport}
					>
						{importing
							? "Importando..."
							: `Importar${files.length > 1 ? ` (${files.length})` : ""}`}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}
