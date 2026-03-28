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

async function main() {
	const email = "nathanzero14@gmail.com"
	const password = "N@thanfelipe0"
	const name = "Admin"

	const existing = await prisma.user.findUnique({ where: { email } })
	if (existing) {
		console.log(`Usuário ${email} já existe, pulando seed.`)
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

	console.log(`✓ Usuário criado: ${email} / ${password}`)
}

main()
	.catch((e) => {
		console.error(e)
		process.exit(1)
	})
	.finally(() => prisma.$disconnect())
