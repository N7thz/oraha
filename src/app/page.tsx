"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field"
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"

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
	} = useForm<FormValues>({ resolver: zodResolver(schema) })

	async function onSubmit(values: FormValues) {
		const { error } = await authClient.signIn.email(values)

		if (error) {
			toast.error(error.message ?? "Credenciais inválidas.")
			return
		}

		router.push("/dashboard")
	}

	return (
		<div className="flex min-h-dvh items-center justify-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Entrar</CardTitle>
					<CardDescription>Acesse sua conta para continuar.</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit(onSubmit)}>
					<CardContent>
						<FieldGroup>
							<Field data-invalid={!!errors.email}>
								<FieldLabel htmlFor="email">E-mail</FieldLabel>
								<Input
									id="email"
									type="email"
									placeholder="seu@email.com"
									aria-invalid={!!errors.email}
									{...register("email")}
								/>
								<FieldError errors={[errors.email]} />
							</Field>
							<Field data-invalid={!!errors.password}>
								<FieldLabel htmlFor="password">Senha</FieldLabel>
								<InputGroup>
									<InputGroupInput
										id="password"
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										aria-invalid={!!errors.password}
										{...register("password")}
									/>
									<InputGroupAddon align="inline-end">
										<InputGroupButton
											onClick={() => setShowPassword((v) => !v)}
											aria-label={
												showPassword ? "Ocultar senha" : "Mostrar senha"
											}
										>
											{showPassword ? (
												<EyeOffIcon data-icon="inline-start" />
											) : (
												<EyeIcon data-icon="inline-start" />
											)}
										</InputGroupButton>
									</InputGroupAddon>
								</InputGroup>
								<FieldError errors={[errors.password]} />
							</Field>
						</FieldGroup>
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
