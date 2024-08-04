import type { Product } from './product.type';

export type AddCardsRequest = Product[];

export type Configuration = {
	id: string;
	name: string;
	op01: string[];
	op02: string[];
	op03: string[];
	op04: string[];
	op05: string[];
	op06: string[];
	op07: string[];
	op08: string[];
	op09: string[];
	prb01: string[];
};

export type Configurations = Configuration[];
