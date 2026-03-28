"use client"

import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
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
		<div className="flex min-h-dvh items-center justify-center px-4">
			<Card className="w-1/3">
				<CardHeader>
					<CardTitle>Entrar</CardTitle>
					<CardDescription>Acesse sua conta para continuar.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="email">E-mail</Label>
							<Input
								id="email"
								type="email"
								placeholder="seu@email.com"
								{...register("email")}
							/>
							{errors.email && (
								<p className="text-sm text-destructive">
									{errors.email.message}
								</p>
							)}
						</div>
						<div className="flex flex-col gap-1.5">
							<Label htmlFor="password">Senha</Label>
							<InputGroup>
								<InputGroupInput
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									{...register("password")}
								/>
								<InputGroupAddon align="inline-end">
									<InputGroupButton
										onClick={() => setShowPassword((v) => !v)}
										aria-label={
											showPassword ? "Ocultar senha" : "Mostrar senha"
										}
									>
										{showPassword ? <EyeOffIcon /> : <EyeIcon />}
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
							{errors.password && (
								<p className="text-sm text-destructive">
									{errors.password.message}
								</p>
							)}
						</div>
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							className="w-full"
							disabled={isSubmitting}
						>
							{isSubmitting ? "Entrando..." : "Entrar"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	)
}
