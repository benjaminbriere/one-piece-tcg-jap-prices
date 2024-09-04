export type Product = {
	id?: string;
	name: string;
	yenPrice: number;
	euroPrice: number;
	euroTaxPrice: number;
	previousEuroTaxPrice: number | undefined | null;
	cardmarketPrice?: number;
	historyPrice: HistoryPrice[];
	url: string;
	link?: string;
	rarity: string;
	code: string;
	state: string;
	parallel: boolean;
	local_url?: string;
};

export type HistoryPrice = {
	price: number;
	date: Date;
};

export type Products = Product[];

export type TotatPrices = {
	yenTotal: number;
	euroTotal: number;
	euroTaxesTotal: number;
};
