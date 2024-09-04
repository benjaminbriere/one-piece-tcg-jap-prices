import type { Product } from './product.type';

export type AddCardsRequest = Product[];

export type Configuration = {
	id: string;
	name: string;
	op01: ConfigurationExtension[];
	op02: ConfigurationExtension[];
	op03: ConfigurationExtension[];
	op04: ConfigurationExtension[];
	op05: ConfigurationExtension[];
	op06: ConfigurationExtension[];
	op07: ConfigurationExtension[];
	op08: ConfigurationExtension[];
	op09: ConfigurationExtension[];
	prb01: ConfigurationExtension[];
};

export type ConfigurationExtension = {
	name: string;
	parallel: boolean;
	rarity: string;
};

export type Configurations = Configuration[];
