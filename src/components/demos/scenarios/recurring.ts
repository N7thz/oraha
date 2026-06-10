import type { AnimStep } from "../engine"
import {
	C,
	badge,
	btn,
	card,
	clamp,
	cursor,
	dialog,
	easeOut,
	hex2rgba,
	inputF,
	lerp,
	miniSidebar,
	toast,
	txt,
} from "../draw"

type RecRow = {
	name: string
	type: "Receita" | "Despesa"
	val: string
	day: string
	active: boolean
}

function recurRow(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	row: RecRow,
	alpha = 1,
) {
	ctx.globalAlpha = alpha
	card(ctx, x, y, w, 36, 7)
	const typeColor = row.type === "Receita" ? C.primary : C.expense
	badge(ctx, x + 8, y + 18, row.type, typeColor)
	txt(ctx, row.name, x + 66, y + 12, { size: 10, weight: "600" })
	txt(ctx, "Todo dia " + row.day, x + 66, y + 24, { size: 8, color: C.muted })
	txt(ctx, row.val, x + w - 80, y + 18, {
		size: 10,
		color: typeColor,
		weight: "600",
		align: "right",
		mono: true,
	})
	badge(ctx, x + w - 72, y + 18, row.active ? "Ativo" : "Pausado", row.active ? C.primary : C.muted)
	ctx.globalAlpha = 1
}

function base(ctx: CanvasRenderingContext2D, w: number, h: number) {
	miniSidebar(ctx, 0, 0, h, 3)
	ctx.fillStyle = C.card
	ctx.fillRect(44, 0, w - 44, 28)
	ctx.strokeStyle = C.border
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(44, 28)
	ctx.lineTo(w, 28)
	ctx.stroke()
	txt(ctx, "Recorrentes", 56, 14, { size: 11, weight: "600" })
}

const ROWS: RecRow[] = [
	{ name: "Salário", type: "Receita", val: "+R$ 6.200", day: "5", active: true },
	{ name: "Internet", type: "Despesa", val: "-R$ 99", day: "10", active: true },
]

export const recurringDemo: AnimStep[] = [
	// Show page
	{
		duration: 900,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			const ey = easeOut(t)
			ctx.globalAlpha = ey
			btn(ctx, w - 116, 34, 108, 24, "+ Nova recorrente", "ghost")
			txt(ctx, "Lançamentos mensais", 56, 44, { size: 10, weight: "600" })
			recurRow(ctx, 52, 54, w - 56, ROWS[0])
			recurRow(ctx, 52, 96, w - 56, ROWS[1])
			ctx.globalAlpha = 1
		},
	},
	// Cursor to button
	{
		duration: 800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 116, 34, 108, 24, "+ Nova recorrente", "ghost")
			txt(ctx, "Lançamentos mensais", 56, 44, { size: 10, weight: "600" })
			recurRow(ctx, 52, 54, w - 56, ROWS[0])
			recurRow(ctx, 52, 96, w - 56, ROWS[1])
			const ey = easeOut(t)
			cursor(ctx, lerp(w - 60, w - 80, ey), lerp(h - 30, 42, ey))
		},
	},
	// Dialog slides in
	{
		duration: 1000,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 116, 34, 108, 24, "+ Nova recorrente", "ghost")
			txt(ctx, "Lançamentos mensais", 56, 44, { size: 10, weight: "600" })
			recurRow(ctx, 52, 54, w - 56, ROWS[0])
			recurRow(ctx, 52, 96, w - 56, ROWS[1])
			cursor(ctx, w - 80, 42, t < 0.3)
			if (t > 0.2) {
				ctx.fillStyle = "rgba(0,0,0,0.5)"
				ctx.fillRect(0, 0, w, h)
				dialog(ctx, w / 2 - 100, h / 2 - 90, 200, 180, "Nova recorrente", clamp((t - 0.2) / 0.8, 0, 1))
			}
		},
	},
	// Fill form
	{
		duration: 3200,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			ctx.fillStyle = "rgba(0,0,0,0.5)"
			ctx.fillRect(0, 0, w, h)

			const dw = 200
			const dh = 180
			const dx = w / 2 - dw / 2
			const dy = h / 2 - dh / 2

			card(ctx, dx, dy, dw, dh, 10)
			txt(ctx, "Nova recorrente", dx + 14, dy + 18, { size: 12, weight: "600" })
			txt(ctx, "Lançamento automático mensal", dx + 14, dy + 30, { size: 8, color: C.muted })

			function typed(full: string, pt: number) {
				return full.slice(0, Math.ceil(full.length * pt))
			}

			const t1 = clamp(t / 0.25, 0, 1)
			const t2 = clamp((t - 0.3) / 0.25, 0, 1)
			const t3 = clamp((t - 0.6) / 0.25, 0, 1)
			const t4 = clamp((t - 0.85) / 0.2, 0, 1)

			// Type buttons
			ctx.globalAlpha = easeOut(t1)
			ctx.beginPath()
			ctx.roundRect(dx + 14, dy + 42, 50, 16, 4)
			ctx.strokeStyle = C.border
			ctx.lineWidth = 1
			ctx.stroke()
			txt(ctx, "Receita", dx + 39, dy + 50, { size: 8, color: C.muted, align: "center" })
			ctx.beginPath()
			ctx.roundRect(dx + 68, dy + 42, 50, 16, 4)
			ctx.fillStyle = hex2rgba(C.expense, 0.18)
			ctx.fill()
			ctx.strokeStyle = hex2rgba(C.expense, 0.5)
			ctx.stroke()
			txt(ctx, "Despesa", dx + 93, dy + 50, { size: 8, color: C.expense, align: "center" })
			ctx.globalAlpha = 1

			inputF(ctx, dx + 14, dy + 68, dw - 28, "Descrição", typed("Aluguel", t2), t2 > 0 && t2 < 1)
			inputF(ctx, dx + 14, dy + 106, dw - 28, "Valor", typed("R$ 1.200,00", t3), t3 > 0 && t3 < 1)
			inputF(ctx, dx + 14, dy + 144, dw - 28, "Dia do mês", typed("5", t4), t4 > 0 && t4 < 1)

			btn(ctx, dx + 14, dy + dh - 28, 60, 20, "Cancelar", "outline")
			btn(ctx, dx + 84, dy + dh - 28, 100, 20, "Salvar")
		},
	},
	// New row appears
	{
		duration: 1800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 116, 34, 108, 24, "+ Nova recorrente", "ghost")
			txt(ctx, "Lançamentos mensais", 56, 44, { size: 10, weight: "600" })
			recurRow(ctx, 52, 54, w - 56, ROWS[0])
			recurRow(ctx, 52, 96, w - 56, ROWS[1])

			const nt = clamp((t - 0.1) / 0.5, 0, 1)
			recurRow(
				ctx,
				52,
				138 + lerp(16, 0, easeOut(nt)),
				w - 56,
				{ name: "Aluguel", type: "Despesa", val: "-R$ 1.200", day: "5", active: true },
				easeOut(nt),
			)

			if (t > 0.45) {
				toast(ctx, w / 2 - 90, 32, "Recorrente criada!", clamp((t - 0.45) / 0.3, 0, 1))
			}
		},
	},
]
