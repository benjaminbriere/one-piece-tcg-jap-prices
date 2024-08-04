export type Product = {
	id?: string;
	name: string;
	yenPrice: number;
	euroPrice: number;
	euroTaxPrice: number;
	url: string;
	link?: string;
	rarity: string;
	code: string;
	state: string;
	parallel: boolean;
};

export type Products = Product[];

export type TotatPrices = {
	yenTotal: number;
	euroTotal: number;
	euroTaxesTotal: number;
};
