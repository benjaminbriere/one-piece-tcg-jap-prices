import { supabase } from '$lib/supabaseClient';
import type { AddCardsRequest } from '$lib/types/api.type.js';

export async function POST({ request }) {
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
				.select('id, yenPrice, euroPrice, euroTaxPrice')
				.eq('code', card.code)
				.eq('state', card.state)
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
				// Si le code et l'état existent déjà, mettre à jour les prix
				console.log(`Updating card with code: ${card.code}, state: ${card.state}`);
				console.log(`Old prices - Yen: ${existingCard.yenPrice}, Euro: ${existingCard.euroPrice}, EuroTax: ${existingCard.euroTaxPrice}`);
				console.log(`New prices - Yen: ${card.yenPrice}, Euro: ${card.euroPrice}, EuroTax: ${card.euroTaxPrice}`);

				const { error: updateError } = await supabase
					.from('cards')
					.update({
						yenPrice: card.yenPrice,
						euroPrice: card.euroPrice,
						euroTaxPrice: card.euroTaxPrice
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
			} else {
				// Si le code et l'état n'existent pas, insérer une nouvelle carte
				const { error: insertError } = await supabase
					.from('cards')
					.insert(card)
					.select(); // Sélectionner les données insérées pour confirmation

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

		return new Response(
			JSON.stringify({ message: 'Data processed successfully', results }),
			{
				status: 200,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	} catch (err) {
		console.error('Unexpected error:', err);
		return new Response(JSON.stringify({ message: 'Unexpected error occurred' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}