import { dinero, toDecimal, add, subtract, multiply, compare } from "dinero.js"
import { BRL } from "@dinero.js/currencies"

/**
 * Cria um objeto Dinero a partir de um valor decimal (ex: 50.00 → 5000 centavos).
 */
export function toDinero(amount: number) {
	const centavos = Math.round(amount * 100)
	return dinero({ amount: centavos, currency: BRL })
}

/**
 * Formata um valor decimal em BRL: 50.00 → "R$ 50,00"
 */
export function formatBRL(amount: number): string {
	return toDecimal(toDinero(amount), ({ value }) =>
		new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(Number(value)),
	)
}

/**
 * Soma dois valores decimais usando Dinero (sem erros de ponto flutuante).
 * Ex: addBRL(0.1, 0.2) → 0.3
 */
export function addBRL(a: number, b: number): number {
	const result = add(toDinero(a), toDinero(b))
	return Number(toDecimal(result))
}

/**
 * Subtrai dois valores decimais usando Dinero.
 */
export function subtractBRL(a: number, b: number): number {
	const result = subtract(toDinero(a), toDinero(b))
	return Number(toDecimal(result))
}

/**
 * Multiplica um valor por um escalar (ex: para calcular porcentagens).
 */
export function multiplyBRL(amount: number, factor: number): number {
	const result = multiply(toDinero(amount), factor)
	return Number(toDecimal(result))
}

/**
 * Compara dois valores: -1 (a < b), 0 (igual), 1 (a > b).
 */
export function compareBRL(a: number, b: number): -1 | 0 | 1 {
	return compare(toDinero(a), toDinero(b))
}
