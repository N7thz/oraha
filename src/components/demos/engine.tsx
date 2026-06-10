"use client"

import { useEffect, useRef, useState } from "react"
import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react"

import { C } from "./draw"

export type AnimStep = {
	duration: number
	draw: (ctx: CanvasRenderingContext2D, t: number, w: number, h: number) => void
}

export type DemoConfig = {
	steps: AnimStep[]
	label: string
}

// Physical canvas resolution
export const CANVAS_W = 1920
export const CANVAS_H = 1080

// Logical drawing space — scale factor is exactly 4.8× in both axes (16:9)
export const LOGICAL_W = 400
export const LOGICAL_H = 225

const SCALE = CANVAS_W / LOGICAL_W // 4.8

export function DemoCanvas({
	config,
	showControls = true,
}: {
	config: DemoConfig
	showControls?: boolean
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const animRef = useRef<number | null>(null)
	const elapsedRef = useRef(0)
	const lastTsRef = useRef<number | null>(null)
	const [playing, setPlaying] = useState(true)
	const playingRef = useRef(true)

	const total = config.steps.reduce((s, step) => s + step.duration, 0)

	function drawFrame(elapsed: number) {
		const canvas = canvasRef.current
		const ctx = canvas?.getContext("2d")
		if (!canvas || !ctx) return

		const t = elapsed % total
		ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
		ctx.fillStyle = C.bg
		ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

		// Scale context so draw functions work in 400×225 logical space
		ctx.save()
		ctx.scale(SCALE, SCALE)

		let acc = 0
		for (const step of config.steps) {
			if (t >= acc && t < acc + step.duration) {
				ctx.save()
				step.draw(ctx, (t - acc) / step.duration, LOGICAL_W, LOGICAL_H)
				ctx.restore()
				break
			}
			acc += step.duration
		}

		ctx.restore()
	}

	useEffect(() => {
		function loop(ts: number) {
			if (!playingRef.current) return
			if (lastTsRef.current !== null) {
				elapsedRef.current += ts - lastTsRef.current
			}
			lastTsRef.current = ts
			drawFrame(elapsedRef.current)
			animRef.current = requestAnimationFrame(loop)
		}

		if (playing) {
			lastTsRef.current = null
			animRef.current = requestAnimationFrame(loop)
		} else {
			if (animRef.current) cancelAnimationFrame(animRef.current)
			drawFrame(elapsedRef.current)
		}

		return () => {
			if (animRef.current) cancelAnimationFrame(animRef.current)
		}
	}, [playing]) // eslint-disable-line react-hooks/exhaustive-deps

	function togglePlay() {
		playingRef.current = !playingRef.current
		setPlaying((p) => !p)
	}

	function restart() {
		elapsedRef.current = 0
		lastTsRef.current = null
		playingRef.current = true
		setPlaying(true)
	}

	return (
		<div className="flex flex-col gap-3">
			<canvas
				ref={canvasRef}
				width={CANVAS_W}
				height={CANVAS_H}
				style={{
					width: "100%",
					height: "auto",
					display: "block",
					borderRadius: "8px",
				}}
			/>
			{showControls && (
				<div className="flex items-center gap-2 px-1">
					<button
						type="button"
						onClick={togglePlay}
						className="flex size-7 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
						style={{ background: "rgba(75,222,124,0.12)", color: "#4bde7c" }}
					>
						{playing ? (
							<PauseIcon className="size-3.5" />
						) : (
							<PlayIcon className="size-3.5" />
						)}
					</button>
					<button
						type="button"
						onClick={restart}
						className="flex size-7 items-center justify-center rounded-lg transition-opacity hover:opacity-80"
						style={{ background: "rgba(255,255,255,0.06)", color: "#547066" }}
					>
						<RotateCcwIcon className="size-3.5" />
					</button>
					<span className="text-[0.65rem]" style={{ color: "#547066" }}>
						{config.label}
					</span>
				</div>
			)}
		</div>
	)
}
