"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import QRCode from "react-qr-code"
import {
	KeyRoundIcon,
	ShieldCheckIcon,
	ShieldOffIcon,
	UserIcon,
} from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"

const profileSchema = z.object({
	name: z.string().min(2, { message: "Nome deve ter ao menos 2 caracteres" }),
})

const passwordSchema = z
	.object({
		currentPassword: z.string().min(1, { message: "Senha atual é obrigatória" }),
		newPassword: z
			.string()
			.min(8, { message: "Nova senha deve ter ao menos 8 caracteres" }),
		confirmPassword: z.string(),
	})
	.refine((d) => d.newPassword === d.confirmPassword, {
		message: "As senhas não coincidem",
		path: ["confirmPassword"],
	})

const totpCodeSchema = z.object({
	code: z
		.string()
		.length(6, { message: "Código deve ter 6 dígitos" })
		.regex(/^\d+$/, { message: "Apenas números" }),
})

const disableTwoFactorSchema = z.object({
	password: z.string().min(1, { message: "Senha é obrigatória" }),
})

type ProfileValues = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>
type TotpCodeValues = z.infer<typeof totpCodeSchema>
type DisableTwoFactorValues = z.infer<typeof disableTwoFactorSchema>

function ProfileCard() {
	const { data: session, isPending } = authClient.useSession()
	const [saving, setSaving] = useState(false)

	const form = useForm<ProfileValues>({
		resolver: zodResolver(profileSchema),
		values: { name: session?.user?.name ?? "" },
	})

	async function onSubmit(values: ProfileValues) {
		setSaving(true)
		try {
			await authClient.updateUser({ name: values.name })
			toast.success("Perfil atualizado!")
		} catch {
			toast.error("Erro ao atualizar perfil")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<UserIcon className="size-4 text-muted-foreground" />
					<CardTitle className="text-sm font-medium">Perfil</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field data-invalid={!!form.formState.errors.name}>
							<FieldLabel>Nome</FieldLabel>
							<Input
								{...form.register("name")}
								placeholder="Seu nome"
								disabled={isPending}
							/>
							<FieldError errors={[form.formState.errors.name]} />
						</Field>
						<Field>
							<FieldLabel>E-mail</FieldLabel>
							<Input
								value={session?.user?.email ?? ""}
								disabled
								className="text-muted-foreground"
							/>
						</Field>
					</FieldGroup>
					<Button
						type="submit"
						size="sm"
						className="mt-4"
						disabled={saving || isPending}
					>
						{saving && <Spinner />}
						Salvar alterações
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}

function PasswordCard() {
	const [saving, setSaving] = useState(false)

	const form = useForm<PasswordValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
	})

	async function onSubmit(values: PasswordValues) {
		setSaving(true)
		try {
			await authClient.changePassword({
				currentPassword: values.currentPassword,
				newPassword: values.newPassword,
				revokeOtherSessions: false,
			})
			toast.success("Senha alterada!")
			form.reset()
		} catch {
			toast.error("Senha atual incorreta ou erro ao alterar senha")
		} finally {
			setSaving(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center gap-2">
					<KeyRoundIcon className="size-4 text-muted-foreground" />
					<CardTitle className="text-sm font-medium">Alterar senha</CardTitle>
				</div>
			</CardHeader>
			<CardContent>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<FieldGroup>
						<Field data-invalid={!!form.formState.errors.currentPassword}>
							<FieldLabel>Senha atual</FieldLabel>
							<Input
								type="password"
								{...form.register("currentPassword")}
								placeholder="••••••••"
							/>
							<FieldError errors={[form.formState.errors.currentPassword]} />
						</Field>
						<Field data-invalid={!!form.formState.errors.newPassword}>
							<FieldLabel>Nova senha</FieldLabel>
							<Input
								type="password"
								{...form.register("newPassword")}
								placeholder="••••••••"
							/>
							<FieldError errors={[form.formState.errors.newPassword]} />
						</Field>
						<Field data-invalid={!!form.formState.errors.confirmPassword}>
							<FieldLabel>Confirmar nova senha</FieldLabel>
							<Input
								type="password"
								{...form.register("confirmPassword")}
								placeholder="••••••••"
							/>
							<FieldError errors={[form.formState.errors.confirmPassword]} />
						</Field>
					</FieldGroup>
					<Button
						type="submit"
						size="sm"
						className="mt-4"
						disabled={saving}
					>
						{saving && <Spinner />}
						Alterar senha
					</Button>
				</form>
			</CardContent>
		</Card>
	)
}

type TwoFactorStep = "idle" | "setup" | "verify" | "disable"

function TwoFactorCard() {
	const { data: session } = authClient.useSession()
	const is2FAEnabled = session?.user?.twoFactorEnabled ?? false

	const [step, setStep] = useState<TwoFactorStep>("idle")
	const [totpUri, setTotpUri] = useState("")
	const [loading, setLoading] = useState(false)

	const verifyForm = useForm<TotpCodeValues>({
		resolver: zodResolver(totpCodeSchema),
		defaultValues: { code: "" },
	})

	const disableForm = useForm<DisableTwoFactorValues>({
		resolver: zodResolver(disableTwoFactorSchema),
		defaultValues: { password: "" },
	})

	async function handleEnable() {
		setLoading(true)
		try {
			const result = await authClient.twoFactor.enable({
				password: prompt("Digite sua senha para continuar:") ?? "",
			})
			if (result?.data?.totpURI) {
				setTotpUri(result.data.totpURI)
				setStep("setup")
			}
		} catch {
			toast.error("Erro ao iniciar configuração do 2FA")
		} finally {
			setLoading(false)
		}
	}

	async function handleVerify(values: TotpCodeValues) {
		setLoading(true)
		try {
			await authClient.twoFactor.verifyTotp({ code: values.code })
			toast.success("Autenticação de dois fatores ativada!")
			setStep("idle")
			verifyForm.reset()
		} catch {
			toast.error("Código inválido. Tente novamente.")
		} finally {
			setLoading(false)
		}
	}

	async function handleDisable(values: DisableTwoFactorValues) {
		setLoading(true)
		try {
			const code = prompt("Digite o código do seu aplicativo autenticador:") ?? ""
			await authClient.twoFactor.disable({
				password: values.password,
				code,
			} as never)
			toast.success("Autenticação de dois fatores desativada")
			setStep("idle")
			disableForm.reset()
		} catch {
			toast.error("Senha incorreta ou código inválido")
		} finally {
			setLoading(false)
		}
	}

	return (
		<Card>
			<CardHeader>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ShieldCheckIcon className="size-4 text-muted-foreground" />
						<CardTitle className="text-sm font-medium">
							Autenticação em dois fatores (2FA)
						</CardTitle>
					</div>
					<Badge
						variant="secondary"
						style={{
							color: is2FAEnabled
								? "hsl(142 71% 45%)"
								: undefined,
						}}
					>
						{is2FAEnabled ? "Ativada" : "Desativada"}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				{!is2FAEnabled && step === "idle" && (
					<>
						<p className="text-sm text-muted-foreground">
							Adicione uma camada extra de segurança à sua conta. Você precisará de
							um aplicativo autenticador (Google Authenticator, Authy, etc.).
						</p>
						<Button
							size="sm"
							onClick={handleEnable}
							disabled={loading}
							className="w-fit"
						>
							{loading && <Spinner />}
							Ativar 2FA
						</Button>
					</>
				)}

				{step === "setup" && totpUri && (
					<>
						<p className="text-sm text-muted-foreground">
							Escaneie o QR code abaixo com seu aplicativo autenticador:
						</p>
						<div className="flex justify-center rounded-lg bg-white p-4">
							<QRCode value={totpUri} size={160} />
						</div>
						<Separator />
						<p className="text-sm text-muted-foreground">
							Depois de escanear, insira o código de 6 dígitos gerado pelo
							aplicativo:
						</p>
						<form onSubmit={verifyForm.handleSubmit(handleVerify)}>
							<FieldGroup>
								<Field data-invalid={!!verifyForm.formState.errors.code}>
									<FieldLabel>Código de verificação</FieldLabel>
									<Input
										{...verifyForm.register("code")}
										placeholder="000000"
										maxLength={6}
										inputMode="numeric"
										className="font-mono tracking-widest"
									/>
									<FieldError errors={[verifyForm.formState.errors.code]} />
								</Field>
							</FieldGroup>
							<div className="mt-4 flex gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => setStep("idle")}
								>
									Cancelar
								</Button>
								<Button type="submit" size="sm" disabled={loading}>
									{loading && <Spinner />}
									Confirmar
								</Button>
							</div>
						</form>
					</>
				)}

				{is2FAEnabled && step === "idle" && (
					<>
						<p className="text-sm text-muted-foreground">
							O 2FA está ativo. Seu login requer um código do aplicativo
							autenticador.
						</p>
						<Button
							size="sm"
							variant="outline"
							className="w-fit text-destructive hover:text-destructive"
							onClick={() => setStep("disable")}
						>
							<ShieldOffIcon className="size-4" />
							Desativar 2FA
						</Button>
					</>
				)}

				{step === "disable" && (
					<form onSubmit={disableForm.handleSubmit(handleDisable)}>
						<FieldGroup>
							<Field data-invalid={!!disableForm.formState.errors.password}>
								<FieldLabel>Confirme sua senha</FieldLabel>
								<Input
									type="password"
									{...disableForm.register("password")}
									placeholder="••••••••"
								/>
								<FieldError
									errors={[disableForm.formState.errors.password]}
								/>
							</Field>
						</FieldGroup>
						<div className="mt-4 flex gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setStep("idle")}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								size="sm"
								variant="outline"
								className="text-destructive hover:text-destructive"
								disabled={loading}
							>
								{loading && <Spinner />}
								Desativar
							</Button>
						</div>
					</form>
				)}
			</CardContent>
		</Card>
	)
}

export default function SettingsPage() {
	return (
		<>
			<div>
				<h1 className="text-xl font-semibold">Configurações</h1>
				<p className="text-sm text-muted-foreground">
					Gerencie seu perfil e segurança
				</p>
			</div>

			<div className="flex flex-col gap-4 max-w-2xl">
				<ProfileCard />
				<PasswordCard />
				<TwoFactorCard />
			</div>
		</>
	)
}
