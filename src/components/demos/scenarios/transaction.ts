import type { AnimStep } from "../engine"
import {
	C,
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

function base(ctx: CanvasRenderingContext2D, w: number, h: number) {
	miniSidebar(ctx, 0, 0, h, 1)
	ctx.fillStyle = C.card
	ctx.fillRect(44, 0, w - 44, 28)
	ctx.strokeStyle = C.border
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(44, 28)
	ctx.lineTo(w, 28)
	ctx.stroke()
	txt(ctx, "Dashboard", 56, 14, { size: 11, weight: "600" })
}

function txRow(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	w: number,
	type: string,
	cat: string,
	val: string,
	color: string,
	alpha = 1,
) {
	ctx.globalAlpha = alpha
	ctx.strokeStyle = C.border
	ctx.lineWidth = 1
	ctx.beginPath()
	ctx.moveTo(x, y + 20)
	ctx.lineTo(x + w, y + 20)
	ctx.stroke()
	txt(ctx, type, x + 6, y + 10, { size: 9, color: C.muted })
	txt(ctx, cat, x + 6 + 60, y + 10, { size: 9 })
	txt(ctx, val, x + w - 6, y + 10, { size: 10, color, weight: "600", align: "right", mono: true })
	ctx.globalAlpha = 1
}

export const transactionDemo: AnimStep[] = [
	// Show dashboard with list + highlighted button
	{
		duration: 1200,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			// Action buttons area
			btn(ctx, w - 104, 34, 96, 24, "+ Nova transação", "ghost")
			// List header
			txt(ctx, "Transações recentes", 56, 44, { size: 10, weight: "600" })
			// Existing rows
			txRow(ctx, 52, 54, w - 56, "Receita", "Salário", "+R$ 6.200,00", C.primary, easeOut(t))
			txRow(ctx, 52, 74, w - 56, "Despesa", "Moradia", "-R$ 1.200,00", C.expense, easeOut(t))
			txRow(ctx, 52, 94, w - 56, "Despesa", "Alimentação", "-R$ 380,00", C.expense, easeOut(t))

			// Highlight button glow
			if (t > 0.5) {
				const gl = easeOut((t - 0.5) * 2)
				ctx.beginPath()
				ctx.roundRect(w - 104, 34, 96, 24, 6)
				ctx.strokeStyle = hex2rgba(C.primary, gl * 0.6)
				ctx.lineWidth = 1.5
				ctx.stroke()
			}
		},
	},
	// Cursor moves to button
	{
		duration: 900,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 104, 34, 96, 24, "+ Nova transação", "ghost")
			txt(ctx, "Transações recentes", 56, 44, { size: 10, weight: "600" })
			txRow(ctx, 52, 54, w - 56, "Receita", "Salário", "+R$ 6.200,00", C.primary)
			txRow(ctx, 52, 74, w - 56, "Despesa", "Moradia", "-R$ 1.200,00", C.expense)
			txRow(ctx, 52, 94, w - 56, "Despesa", "Alimentação", "-R$ 380,00", C.expense)

			const ey = easeOut(t)
			const cx = lerp(w - 60, w - 80, ey)
			const cy = lerp(h - 30, 42, ey)
			cursor(ctx, cx, cy)
		},
	},
	// Click + dialog appears
	{
		duration: 1500,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			btn(ctx, w - 104, 34, 96, 24, "+ Nova transação", "ghost")
			txt(ctx, "Transações recentes", 56, 44, { size: 10, weight: "600" })
			txRow(ctx, 52, 54, w - 56, "Receita", "Salário", "+R$ 6.200,00", C.primary)
			txRow(ctx, 52, 74, w - 56, "Despesa", "Moradia", "-R$ 1.200,00", C.expense)
			txRow(ctx, 52, 94, w - 56, "Despesa", "Alimentação", "-R$ 380,00", C.expense)

			cursor(ctx, w - 80, 42, t < 0.2)

			if (t > 0.15) {
				const slideT = clamp((t - 0.15) / 0.85, 0, 1)
				const dw = 200
				const dh = 175
				// Overlay
				ctx.fillStyle = "rgba(0,0,0,0.5)"
				ctx.fillRect(0, 0, w, h)
				dialog(ctx, w / 2 - dw / 2, h / 2 - dh / 2, dw, dh, "Nova transação", slideT)
			}
		},
	},
	// Fill in form fields
	{
		duration: 3200,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			ctx.fillStyle = "rgba(0,0,0,0.5)"
			ctx.fillRect(0, 0, w, h)

			const dw = 200
			const dh = 175
			const dx = w / 2 - dw / 2
			const dy = h / 2 - dh / 2

			card(ctx, dx, dy, dw, dh, 10)
			txt(ctx, "Nova transação", dx + 14, dy + 18, { size: 12, weight: "600" })

			const phase = (t: number, from: number, to: number) => clamp((t - from) / (to - from), 0, 1)
			const t1 = phase(t, 0, 0.25)
			const t2 = phase(t, 0.3, 0.55)
			const t3 = phase(t, 0.6, 0.85)

			// Type radio
			ctx.globalAlpha = easeOut(t1)
			txt(ctx, "Tipo:", dx + 14, dy + 42, { size: 8, color: C.muted })
			ctx.beginPath()
			ctx.roundRect(dx + 14, dy + 50, 50, 16, 4)
			ctx.strokeStyle = C.border
			ctx.lineWidth = 1
			ctx.stroke()
			txt(ctx, "Receita", dx + 39, dy + 58, { size: 8, color: C.muted, align: "center" })
			ctx.beginPath()
			ctx.roundRect(dx + 68, dy + 50, 50, 16, 4)
			ctx.fillStyle = hex2rgba(C.expense, 0.2)
			ctx.fill()
			ctx.strokeStyle = hex2rgba(C.expense, 0.5)
			ctx.stroke()
			txt(ctx, "Despesa", dx + 93, dy + 58, { size: 8, color: C.expense, align: "center" })
			ctx.globalAlpha = 1

			// Amount (compact 22px field)
			inputF(ctx, dx + 14, dy + 78, dw - 28, "Valor", typed("R$ 85,00", t2), t2 > 0 && t2 < 1, 22)

			// Category (compact 22px field, 12px gap after Valor)
			inputF(ctx, dx + 14, dy + 114, dw - 28, "Categoria", typed("Alimentação", t3), t3 > 0 && t3 < 1, 22)

			// Buttons
			btn(ctx, dx + 14, dy + dh - 28, 60, 20, "Cancelar", "outline")
			btn(ctx, dx + 84, dy + dh - 28, 100, 20, "Salvar")

			// Animated cursor
			if (t > 0 && t < 0.3) {
				cursor(ctx, dx + 70, dy + 58 + lerp(0, 20, easeOut(t / 0.3)))
			} else if (t >= 0.3 && t < 0.6) {
				cursor(ctx, dx + 70, dy + 89)
			} else if (t >= 0.6 && t < 0.88) {
				cursor(ctx, dx + 70, dy + 125)
			} else if (t >= 0.88) {
				const cx = lerp(dx + 70, dx + 134, easeOut((t - 0.88) / 0.12))
				cursor(ctx, cx, dy + dh - 18)
			}

			function typed(full: string, pt: number) {
				return full.slice(0, Math.ceil(full.length * pt))
			}
		},
	},
	// Click save + dialog closes + new row
	{
		duration: 1800,
		draw(ctx, t, w, h) {
			base(ctx, w, h)
			txt(ctx, "Transações recentes", 56, 44, { size: 10, weight: "600" })

			if (t < 0.3) {
				// Dialog closing
				ctx.fillStyle = "rgba(0,0,0," + (0.5 * easeOut(1 - t / 0.3)).toString() + ")"
				ctx.fillRect(0, 0, w, h)
				const dw = 200
				const dh = 175
				ctx.globalAlpha = easeOut(1 - t / 0.3)
				card(ctx, w / 2 - dw / 2, h / 2 - dh / 2, dw, dh, 10)
				ctx.globalAlpha = 1
			}

			// Rows
			txRow(ctx, 52, 54, w - 56, "Receita", "Salário", "+R$ 6.200,00", C.primary)
			txRow(ctx, 52, 74, w - 56, "Despesa", "Moradia", "-R$ 1.200,00", C.expense)
			txRow(ctx, 52, 94, w - 56, "Despesa", "Alimentação", "-R$ 380,00", C.expense)

			// New row appears
			if (t > 0.3) {
				const nt = clamp((t - 0.3) / 0.4, 0, 1)
				txRow(ctx, 52, 54, w - 56, "Despesa", "Alimentação", "-R$ 85,00", C.expense, easeOut(nt))
			}

			// Toast
			if (t > 0.5) {
				toast(ctx, w / 2 - 90, 32, "Transação criada!", clamp((t - 0.5) / 0.3, 0, 1))
			}

			btn(ctx, w - 104, 34, 96, 24, "+ Nova transação", "ghost")
		},
	},
]
