"use client"

import { useState } from "react"
import { PlayCircleIcon } from "lucide-react"

import { DEMOS, DemoModal } from "./demo-modal"

export function DemoSection() {
	const [openAt, setOpenAt] = useState<number | null>(null)

	return (
		<>
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
				{DEMOS.map((demo, i) => {
					const Icon = demo.icon
					return (
						<button
							key={demo.id}
							type="button"
							onClick={() => setOpenAt(i)}
							className="group flex flex-col items-start gap-3 rounded-xl p-4 text-left transition-all hover:scale-[1.02]"
							style={{
								background: "var(--card)",
								border: "1px solid var(--border)",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.borderColor = `${demo.color}30`
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.borderColor = "var(--border)"
							}}
						>
							{/* Icon */}
							<div className="flex w-full items-center justify-between">
								<div
									className="flex size-8 items-center justify-center rounded-lg transition-transform group-hover:scale-110"
									style={{ background: `${demo.color}18` }}
								>
									<Icon className="size-4" style={{ color: demo.color }} />
								</div>
								<PlayCircleIcon
									className="size-4 opacity-0 transition-opacity group-hover:opacity-100"
									style={{ color: demo.color }}
								/>
							</div>

							{/* Label + description */}
							<div>
								<p className="mb-1 text-sm font-semibold">{demo.label}</p>
								<p
									className="text-xs leading-relaxed"
									style={{ color: "var(--muted-foreground)" }}
								>
									{demo.description}
								</p>
							</div>
						</button>
					)
				})}
			</div>

			{openAt !== null && (
				<DemoModal initialIndex={openAt} onClose={() => setOpenAt(null)} />
			)}
		</>
	)
}
