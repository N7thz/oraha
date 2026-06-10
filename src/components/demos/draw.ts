// Canvas drawing primitives for feature demos

type Ctx = CanvasRenderingContext2D

export const C = {
	bg: "#09150e",
	card: "#0f2118",
	surface: "#0c1a12",
	border: "rgba(255,255,255,0.07)",
	text: "#dff2e8",
	muted: "#547066",
	primary: "#4bde7c",
	expense: "#f87185",
	income: "#4bde7c",
	blue: "#38bdf8",
	orange: "#fb923c",
	purple: "#a78bfa",
} as const

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeOut = (t: number) => 1 - (1 - t) ** 3
export const easeInOut = (t: number) =>
	t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2
export const clamp = (v: number, lo: number, hi: number) =>
	Math.max(lo, Math.min(hi, v))
export const typed = (text: string, t: number) =>
	text.slice(0, Math.ceil(text.length * clamp(t, 0, 1)))
export const hex2rgba = (hex: string, a: number) => {
	const r = parseInt(hex.slice(1, 3), 16)
	const g = parseInt(hex.slice(3, 5), 16)
	const b = parseInt(hex.slice(5, 7), 16)
	return `rgba(${r},${g},${b},${a})`
}

// ─── Primitives ───────────────────────────────────────────────────────────────

export function fillR(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
	color: string,
) {
	ctx.beginPath()
	ctx.roundRect(x, y, w, h, r)
	ctx.fillStyle = color
	ctx.fill()
}

export function strokeR(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	r: number,
	color: string,
	lw = 1,
) {
	ctx.beginPath()
	ctx.roundRect(x, y, w, h, r)
	ctx.strokeStyle = color
	ctx.lineWidth = lw
	ctx.stroke()
}

export function txt(
	ctx: Ctx,
	str: string,
	x: number,
	y: number,
	opts: {
		size?: number
		color?: string
		align?: CanvasTextAlign
		weight?: string
		mono?: boolean
		alpha?: number
	} = {},
) {
	const {
		size = 11,
		color = C.text,
		align = "left",
		weight = "400",
		mono = false,
		alpha = 1,
	} = opts
	const family = mono
		? "ui-monospace, monospace"
		: "system-ui, -apple-system, sans-serif"
	const prevAlpha = ctx.globalAlpha
	ctx.font = `${weight} ${size}px ${family}`
	ctx.fillStyle = color
	ctx.globalAlpha = prevAlpha * alpha
	ctx.textAlign = align
	ctx.textBaseline = "middle"
	ctx.fillText(str, x, y)
	ctx.globalAlpha = prevAlpha
}

export function txtW(ctx: Ctx, str: string, size = 11, weight = "400") {
	ctx.font = `${weight} ${size}px system-ui, -apple-system, sans-serif`
	return ctx.measureText(str).width
}

// ─── UI Components ────────────────────────────────────────────────────────────

export function card(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	r = 8,
) {
	fillR(ctx, x, y, w, h, r, C.card)
	strokeR(ctx, x, y, w, h, r, C.border)
}

export function btn(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	label: string,
	variant: "primary" | "ghost" | "outline" = "primary",
) {
	if (variant === "primary") {
		fillR(ctx, x, y, w, h, 6, C.primary)
		txt(ctx, label, x + w / 2, y + h / 2, {
			size: 10,
			color: "#0b1e13",
			align: "center",
			weight: "600",
		})
	} else if (variant === "ghost") {
		fillR(ctx, x, y, w, h, 6, hex2rgba(C.primary, 0.13))
		txt(ctx, label, x + w / 2, y + h / 2, {
			size: 10,
			color: C.primary,
			align: "center",
			weight: "600",
		})
	} else {
		strokeR(ctx, x, y, w, h, 6, C.border)
		txt(ctx, label, x + w / 2, y + h / 2, {
			size: 10,
			color: C.muted,
			align: "center",
		})
	}
}

export function inputF(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	label: string,
	value: string,
	active = false,
	fh = 28,
) {
	fillR(ctx, x, y, w, fh, 5, C.bg)
	strokeR(ctx, x, y, w, fh, 5, active ? hex2rgba(C.primary, 0.5) : C.border, active ? 1.5 : 1)
	if (label) txt(ctx, label, x + 8, y - 6, { size: 8, color: C.muted })
	if (value) {
		txt(ctx, value, x + 8, y + fh / 2, { size: 10 })
		if (active) {
			const vw = txtW(ctx, value, 10)
			ctx.fillStyle = C.primary
			ctx.fillRect(x + 8 + vw + 1, y + (fh - 14) / 2, 1, 14)
		}
	} else {
		txt(ctx, "…", x + 8, y + fh / 2, { size: 10, color: C.muted, alpha: 0.4 })
	}
}

export function cursor(ctx: Ctx, x: number, y: number, clicking = false) {
	ctx.save()
	ctx.translate(x, y)
	if (clicking) ctx.scale(0.9, 0.9)
	ctx.beginPath()
	ctx.moveTo(0, 0)
	ctx.lineTo(0, 13)
	ctx.lineTo(3, 10)
	ctx.lineTo(5.5, 15)
	ctx.lineTo(7.5, 14)
	ctx.lineTo(5, 9)
	ctx.lineTo(9, 9)
	ctx.closePath()
	ctx.fillStyle = clicking ? C.primary : "#ffffff"
	ctx.strokeStyle = "rgba(0,0,0,0.55)"
	ctx.lineWidth = 1.2
	ctx.fill()
	ctx.stroke()
	if (clicking) {
		ctx.beginPath()
		ctx.arc(4, 6, 7, 0, Math.PI * 2)
		ctx.strokeStyle = hex2rgba(C.primary, 0.4)
		ctx.lineWidth = 1.5
		ctx.stroke()
	}
	ctx.restore()
}

export function progressBar(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	t: number,
	color: string,
) {
	fillR(ctx, x, y, w, h, h / 2, hex2rgba(color, 0.12))
	if (t > 0) {
		fillR(ctx, x, y, Math.max(h, w * t), h, h / 2, color)
	}
}

export function vBar(
	ctx: Ctx,
	x: number,
	baseY: number,
	w: number,
	maxH: number,
	t: number,
	color: string,
) {
	const h = maxH * Math.max(0, t)
	if (h < 1) return
	fillR(ctx, x, baseY - h, w, h, 3, color)
}

export function badge(
	ctx: Ctx,
	x: number,
	y: number,
	label: string,
	color: string,
) {
	const w = txtW(ctx, label, 8, "600") + 12
	const h = 15
	fillR(ctx, x, y - h / 2, w, h, 7, hex2rgba(color, 0.2))
	txt(ctx, label, x + 6, y, { size: 8, color, weight: "600" })
	return w
}

export function checkmark(
	ctx: Ctx,
	cx: number,
	cy: number,
	size: number,
	color: string,
) {
	ctx.strokeStyle = color
	ctx.lineWidth = 1.5
	ctx.lineCap = "round"
	ctx.lineJoin = "round"
	ctx.beginPath()
	ctx.moveTo(cx - size / 2, cy)
	ctx.lineTo(cx - size / 6, cy + size / 3)
	ctx.lineTo(cx + size / 2, cy - size / 3)
	ctx.stroke()
}

export function miniSidebar(
	ctx: Ctx,
	x: number,
	y: number,
	h: number,
	active: number,
) {
	const w = 44
	fillR(ctx, x, y, w, h, 0, C.card)
	strokeR(ctx, x, y, w, h, 0, C.border)
	txt(ctx, "O.", x + w / 2, y + 16, {
		size: 12,
		color: C.primary,
		align: "center",
		weight: "700",
	})
	const icons = ["▦", "⇄", "◎", "↺", "?"]
	for (let i = 0; i < icons.length; i++) {
		const iy = y + 36 + i * 26
		if (i === active) {
			fillR(ctx, x + 4, iy - 9, w - 8, 18, 4, hex2rgba(C.primary, 0.15))
			txt(ctx, icons[i], x + w / 2, iy, {
				size: 11,
				color: C.primary,
				align: "center",
			})
		} else {
			txt(ctx, icons[i], x + w / 2, iy, {
				size: 11,
				color: C.muted,
				align: "center",
			})
		}
	}
}

export function dialog(
	ctx: Ctx,
	x: number,
	y: number,
	w: number,
	h: number,
	title: string,
	slideT: number,
) {
	const ey = easeOut(slideT)
	const dy = lerp(50, 0, ey)
	const opacity = lerp(0, 1, ey)
	ctx.globalAlpha = opacity
	card(ctx, x, y + dy, w, h, 10)
	txt(ctx, title, x + 14, y + dy + 18, { size: 12, weight: "600" })
	ctx.globalAlpha = 1
}

export function toast(
	ctx: Ctx,
	x: number,
	y: number,
	message: string,
	t: number,
) {
	const ey = easeOut(t)
	const dy = lerp(-20, 0, ey)
	ctx.globalAlpha = ey
	fillR(ctx, x, y + dy, 180, 30, 8, C.card)
	strokeR(ctx, x, y + dy, 180, 30, 8, hex2rgba(C.primary, 0.3))
	ctx.fillStyle = C.primary
	ctx.beginPath()
	ctx.arc(x + 18, y + dy + 15, 6, 0, Math.PI * 2)
	ctx.fill()
	checkmark(ctx, x + 18, y + dy + 15, 6, "#0b1e13")
	txt(ctx, message, x + 32, y + dy + 15, { size: 10 })
	ctx.globalAlpha = 1
}
