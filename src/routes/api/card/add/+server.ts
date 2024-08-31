import { supabase } from '$lib/supabaseClient';
import type { AddCardsRequest } from '$lib/types/api.type.js';
import fs from 'node:fs';
import path from 'node:path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Définition de __filename et __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function POST({ request }) {

	async function downloadImage(url: string, filepath: string) {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		fs.writeFileSync(filepath, buffer);
	}

	async function downloadAndSaveImage(url: string, code: string, rarity: string, state: string, parallel: boolean) {

		// Créez un dossier pour les images s'il n'existe pas
		const imagesDir = path.join(__dirname, 'images');
		if (!fs.existsSync(imagesDir)) {
			fs.mkdirSync(imagesDir);
		}

		const filename = `${code}${parallel? `_aa`: ''}${rarity === "MANGA" ? `_manga`: ''}${state === "PSA10" ? `_psa`: ''}.png`; // Récupère le nom de fichier depuis l'URL
		const filepath = path.join(imagesDir, filename);

		if (fs.existsSync(filepath)) {
			console.log(`File already exists: ${filename}`);
			return filename; // Passez au fichier suivant si celui-ci existe déjà
		}

		try {
			await downloadImage(url, filepath);
			console.log(`Downloaded and saved ${filename}`);
			return filename;
		} catch (error) {
			console.error(`Error downloading ${url}:`, error);
		}
	}

	try {
		const cards: AddCardsRequest = await request.json();

		if (
			!Array.isArray(cards) ||
			cards.some(
				(card) =>
					!card.yenPrice ||
					!card.euroPrice ||
					!card.euroTaxPrice ||
					!card.url ||
					!card.rarity ||
					!card.code ||
					!card.state
			)
		) {
			return new Response(JSON.stringify({ message: 'Invalid input' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const results = [];

		for (const card of cards) {
			// Vérifier si le code et l'état existent déjà dans la base
			const { data: existingCard, error: fetchError } = await supabase
				.from('cards')
				.select('id, yenPrice, euroPrice, euroTaxPrice, link, local_url, historyPrice')
				.eq('code', card.code)
				.eq('rarity', card.rarity)
				.eq('state', card.state)
				.eq('parallel', card.parallel)
				.single(); // On s'attend à une seule ligne

			if (fetchError && fetchError.code !== 'PGRST116') {
				// Ignorer l'erreur "no rows returned" (PGRST116)
				console.error('Error checking existing card:', fetchError.message);
				return new Response(JSON.stringify({ message: fetchError.message }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			if (existingCard) {
				let localURL = existingCard.local_url;
				if(localURL === null){
					localURL = await downloadAndSaveImage(card.url, card.code, card.rarity, card.state, card.parallel)
				}

				// Si le code et l'état existent déjà, mettre à jour les prix
				if (
					existingCard.yenPrice !== card.yenPrice
					|| existingCard.euroPrice !== card.euroPrice
					|| existingCard.euroTaxPrice !== card.euroTaxPrice
					|| existingCard.link !== card.link
					|| existingCard.local_url !== localURL
				) {

					console.log(`Updating card with code: ${card.code}, state: ${card.state}`);
					console.log(
						`Old prices - Yen: ${existingCard.yenPrice}, Euro: ${existingCard.euroPrice}, EuroTax: ${existingCard.euroTaxPrice}`
					);
					console.log(
						`New prices - Yen: ${card.yenPrice}, Euro: ${card.euroPrice}, EuroTax: ${card.euroTaxPrice}`
					);

					const { error: updateError } = await supabase
						.from('cards')
						.update({
							yenPrice: card.yenPrice,
							euroPrice: card.euroPrice,
							euroTaxPrice: card.euroTaxPrice,
							link: card.link,
							local_url: localURL,
							previousEuroTaxPrice: existingCard.euroTaxPrice,
							historyPrice: [...existingCard.historyPrice, {price: card.euroTaxPrice, date: new Date()}]
						})
						.eq('id', existingCard.id); // Mise à jour basée sur l'ID

					if (updateError) {
						console.error('Error updating data:', updateError.message);
						return new Response(JSON.stringify({ message: updateError.message }), {
							status: 500,
							headers: { 'Content-Type': 'application/json' }
						});
					}

					results.push({ action: 'updated', code: card.code, state: card.state });
				}

			} else {
				// Si le code et l'état n'existent pas, insérer une nouvelle carte
				const localURL = await downloadAndSaveImage(card.url, card.code, card.rarity, card.state, card.parallel)

				const { error: insertError } = await supabase.from('cards').insert({...card, local_url: localURL, historyPrice: [{price: card.euroTaxPrice, date: new Date()}]} ).select(); // Sélectionner les données insérées pour confirmation

				if (insertError) {
					console.error('Error inserting data:', insertError.message);
					return new Response(JSON.stringify({ message: insertError.message }), {
						status: 500,
						headers: { 'Content-Type': 'application/json' }
					});
				}

				results.push({ action: 'inserted', code: card.code, state: card.state });
			}
		}

		return new Response(JSON.stringify({ message: 'Data processed successfully', results }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ message: 'Unexpected error occurred' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
