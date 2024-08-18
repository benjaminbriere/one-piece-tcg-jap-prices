import type { Product, Products, TotatPrices } from '$lib/types/product.type';
import {
	SITE_OP01,
	SITE_OP02,
	SITE_OP03,
	SITE_OP04,
	SITE_OP05,
	SITE_OP06,
	SITE_OP07,
	SITE_OP08,
	SITE_PRB01
} from './constants';

import type { Configuration } from '$lib/types/api.type';
import { ChartLineUpOutline } from 'flowbite-svelte-icons';

export function extractRarity(str: string) {
	const matches = str.match(/【([^】]+)】/g);
	if (str.includes('SP')) {
		return 'SP';
	}
	if (str.includes('漫画背景')) {
		return 'MANGA';
	}
	if (matches) {
		return matches.map((match) => match.slice(1, -1))[0]; // Supprimer les crochets
	}
	return '';
}

export function extractCode(str: string) {
	const matches = str.match(/{([^}]+)}/g);
	if (matches) {
		return matches.map((match) => match.slice(1, -1))[0].replace('○', ''); // Supprimer les accolades
	}
	return '';
}

export function extractImageInfo(imgTag: string) {
	// Extraire l'URL de l'image
	const srcMatch = imgTag.match(/src="([^"]+)"/);
	return srcMatch ? srcMatch[1] : '';
}

export function totalPricesCalc(products: Products): TotatPrices {
	const yenTotal = products.reduce((a: number, b: Product) => a + b.yenPrice, 0);
	const euroTotal = products.reduce((a: number, b: Product) => a + b.euroPrice, 0);
	const euroTaxesTotal = products.reduce((a: number, b: Product) => a + b.euroTaxPrice, 0);

	return {
		yenTotal: yenTotal,
		euroTotal: euroTotal,
		euroTaxesTotal: euroTaxesTotal
	};
}

export function extractState(str: string) {
	const matches = str.match(/〔([^〕]+)〕/g);
	const state = matches?.[0].slice(1, -1) ?? '';
	if (state === 'PSA10鑑定済') return 'PSA10';
	if (state === '状態A-') return 'A-';
	if (state === '状態B-') return 'B-';
	if (state === '状態C-') return 'C-';
	if (state === '状態B') return 'B';
	if (state === '状態C') return 'C';
	return 'A';
}

export function webURL(value: string) {
	switch (value) {
		case 'OP01':
			return SITE_OP01;
		case 'OP02':
			return SITE_OP02;
		case 'OP03':
			return SITE_OP03;
		case 'OP04':
			return SITE_OP04;
		case 'OP05':
			return SITE_OP05;
		case 'OP06':
			return SITE_OP06;
		case 'OP07':
			return SITE_OP07;
		case 'OP08':
			return SITE_OP08;
		case 'PRB01':
			return SITE_PRB01;
		default:
			return SITE_OP01;
	}
}

export function convertExtensionToConfigurationKey(value: string): keyof Configuration {
	switch (value) {
		case 'OP01':
			return 'op01';
		case 'OP02':
			return 'op02';
		case 'OP03':
			return 'op03';
		case 'OP04':
			return 'op04';
		case 'OP05':
			return 'op05';
		case 'OP06':
			return 'op06';
		case 'OP07':
			return 'op07';
		case 'OP08':
			return 'op08';
		case 'PRB01':
			return 'prb01';
		default:
			return 'op01';
	}
}

export function isCardMissing(
	key: keyof Configuration,
	value: string,
	parallel: boolean,
	rarity: string,
	configuration?: Configuration
): boolean {
	if (configuration) {
		const currentExtensionData = configuration[key];

		if (Array.isArray(currentExtensionData)) {
			return currentExtensionData.some(
				(item) => item.name === value && item.parallel === parallel && item.rarity === rarity
			);
		}
	}
	return false;
}

export function generateKey(item: Product) {
	return `${item.code}-${item.rarity}-${item.state}-${item.parallel}`;
}