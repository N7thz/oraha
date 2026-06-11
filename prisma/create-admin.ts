import * as readline from "node:readline"
import { scryptAsync } from "@noble/hashes/scrypt.js"
import { bytesToHex, randomBytes } from "@noble/hashes/utils.js"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SCRYPT_CONFIG = { N: 16384, r: 16, p: 1, dkLen: 64 }

async function hashPassword(password: string): Promise<string> {
	const salt = bytesToHex(randomBytes(16))
	const key = await scryptAsync(password.normalize("NFKC"), salt, {
		...SCRYPT_CONFIG,
		maxmem: 128 * SCRYPT_CONFIG.N * SCRYPT_CONFIG.r * 2,
	})
	return `${salt}:${bytesToHex(key)}`
}

function parseArgs(): Record<string, string> {
	const args = process.argv.slice(2)
	const result: Record<string, string> = {}
	for (let i = 0; i < args.length; i++) {
		if (args[i].startsWith("--") && args[i + 1] && !args[i + 1].startsWith("--")) {
			result[args[i].slice(2)] = args[i + 1]
			i++
		}
	}
	return result
}

function prompt(rl: readline.Interface, question: string): Promise<string> {
	return new Promise((resolve) => rl.question(question, resolve))
}

function promptPassword(question: string): Promise<string> {
	return new Promise((resolve) => {
		process.stdout.write(question)
		const stdin = process.stdin
		stdin.setRawMode(true)
		stdin.resume()
		stdin.setEncoding("utf8")
		let password = ""
		stdin.on("data", function handler(ch: string) {
			if (ch === "\r" || ch === "\n") {
				stdin.setRawMode(false)
				stdin.pause()
				stdin.removeListener("data", handler)
				process.stdout.write("\n")
				resolve(password)
			} else if (ch === "") {
				process.stdout.write("\n")
				process.exit()
			} else if (ch === "") {
				if (password.length > 0) {
					password = password.slice(0, -1)
					process.stdout.write("\b \b")
				}
			} else {
				password += ch
				process.stdout.write("*")
			}
		})
	})
}

async function main() {
	const flags = parseArgs()

	let name = flags.name
	let email = flags.email
	let password = flags.password

	if (!name || !email || !password) {
		const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

		console.log("\nCriação de usuário admin\n")

		if (!name) {
			name = await prompt(rl, "Nome completo: ")
			name = name.trim()
		}

		if (!email) {
			email = await prompt(rl, "E-mail: ")
			email = email.trim().toLowerCase()
		}

		rl.close()

		if (!password) {
			password = await promptPassword("Senha: ")
			const confirm = await promptPassword("Confirme a senha: ")
			if (password !== confirm) {
				console.error("\nErro: as senhas não coincidem.")
				process.exit(1)
			}
		}
	}

	if (!name || !email || !password) {
		console.error("Erro: nome, e-mail e senha são obrigatórios.")
		console.error("Uso: bun run create-admin -- --name \"Nome\" --email \"email@exemplo.com\" --password \"Senha123\"")
		process.exit(1)
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
	if (!emailRegex.test(email)) {
		console.error(`Erro: e-mail inválido: ${email}`)
		process.exit(1)
	}

	if (password.length < 8) {
		console.error("Erro: a senha deve ter pelo menos 8 caracteres.")
		process.exit(1)
	}

	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) {
		console.log(`\nUsuário já existe: ${email}`)
		console.log("Nenhuma alteração realizada.")
		return
	}

	const now = new Date()
	const userId = crypto.randomUUID()

	await prisma.user.create({
		data: {
			id: userId,
			name,
			email,
			emailVerified: true,
			createdAt: now,
			updatedAt: now,
		},
	})

	await prisma.account.create({
		data: {
			id: crypto.randomUUID(),
			accountId: userId,
			providerId: "credential",
			userId,
			password: await hashPassword(password),
			createdAt: now,
			updatedAt: now,
		},
	})

	console.log(`\n✓ Usuário criado com sucesso!`)
	console.log(`  Nome:  ${name}`)
	console.log(`  Email: ${email}`)
}

main()
	.catch((e) => {
		console.error("\nErro ao criar usuário:", e.message ?? e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
