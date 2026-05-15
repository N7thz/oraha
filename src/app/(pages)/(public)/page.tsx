"use client"

import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const schema = z.object({
	email: z.email("E-mail inválido."),
	password: z.string().min(1, "Senha obrigatória."),
})

type FormValues = z.infer<typeof schema>

export default function SignInPage() {
	const router = useRouter()
	const [showPassword, setShowPassword] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
	})

	async function onSubmit({ email, password }: FormValues) {
		const { error } = await authClient.signIn.email({ email, password })
		if (error) {
			toast.error(error.message ?? "Credenciais inválidas.")
			return
		}
		router.push("/dashboard")
	}

	return (
		<div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#06100d] px-4">
			{/* Ambient glows */}
			<div
				aria-hidden
				className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/3 -translate-y-1/3 rounded-full opacity-30"
				style={{
					background:
						"radial-gradient(circle, #4bde7c22 0%, transparent 70%)",
				}}
			/>
			<div
				aria-hidden
				className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/3 translate-y-1/3 rounded-full opacity-20"
				style={{
					background:
						"radial-gradient(circle, #4bde7c18 0%, transparent 70%)",
				}}
			/>

			<div className="relative z-10 flex w-full max-w-[360px] flex-col items-center gap-10">
				{/* Wordmark */}
				<div className="flex flex-col items-center gap-1 text-center">
					<h1
						className="font-display text-6xl italic tracking-tight"
						style={{ color: "#dff2e8" }}
					>
						Oraha.
					</h1>
					<p
						className="text-[0.7rem] uppercase tracking-[0.22em]"
						style={{ color: "#547066" }}
					>
						Gestão financeira pessoal
					</p>
				</div>

				{/* Form card */}
				<div
					className="w-full rounded-2xl p-6"
					style={{
						background: "rgba(12, 26, 18, 0.85)",
						border: "1px solid #1b2d22",
						backdropFilter: "blur(12px)",
					}}
				>
					<form
						onSubmit={handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						{/* Email */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="email"
								className="text-xs font-medium uppercase tracking-widest"
								style={{ color: "#547066" }}
							>
								E-mail
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="seu@email.com"
								{...register("email")}
								className="h-10 w-full rounded-lg px-3 text-sm outline-none transition-colors focus:ring-1"
								style={{
									background: "#111e17",
									border: "1px solid #1b2d22",
									color: "#dff2e8",
								}}
							/>
							{errors.email && (
								<p className="text-xs" style={{ color: "#f87185" }}>
									{errors.email.message}
								</p>
							)}
						</div>

						{/* Password */}
						<div className="flex flex-col gap-1.5">
							<label
								htmlFor="password"
								className="text-xs font-medium uppercase tracking-widest"
								style={{ color: "#547066" }}
							>
								Senha
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									autoComplete="current-password"
									placeholder="••••••••"
									{...register("password")}
									className="h-10 w-full rounded-lg px-3 pr-10 text-sm outline-none transition-colors focus:ring-1"
									style={{
										background: "#111e17",
										border: "1px solid #1b2d22",
										color: "#dff2e8",
									}}
								/>
								<button
									type="button"
									onClick={() => setShowPassword((v) => !v)}
									className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
									style={{ color: "#547066" }}
									aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
								>
									{showPassword ? (
										<EyeOffIcon className="size-4" />
									) : (
										<EyeIcon className="size-4" />
									)}
								</button>
							</div>
							{errors.password && (
								<p className="text-xs" style={{ color: "#f87185" }}>
									{errors.password.message}
								</p>
							)}
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={isSubmitting}
							className="mt-2 h-10 w-full rounded-lg text-sm font-semibold tracking-wide transition-all disabled:opacity-50"
							style={{
								background: isSubmitting ? "#2da05a" : "#4bde7c",
								color: "#06100d",
							}}
						>
							{isSubmitting ? "Entrando..." : "Entrar"}
						</button>
					</form>
				</div>

				<p
					className="text-center text-[0.65rem] uppercase tracking-[0.18em]"
					style={{ color: "#2d4a38" }}
				>
					Suas finanças. Seu controle.
				</p>
			</div>
		</div>
	)
}
