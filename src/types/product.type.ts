export type Product = {
    name: string
    yenPrice: number
    euroPrice: number
    euroTaxPrice: number
    url: string
    link: string
    rarity?: string
    code?: string
    state?: string
}

export type Products = Product[]

export type MissingCard = {
    name: string
}

export type TotatPrices = {
    yenTotal: number
    euroTotal: number
    euroTaxesTotal: number
}