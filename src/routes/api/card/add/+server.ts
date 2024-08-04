import { supabase } from '$lib/supabaseClient';
import type { AddCardsRequest } from '$lib/types/api.type.js'; // Assurez-vous que le chemin est correct

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

		const insertCards = [];
		const updateCards = [];

		for (const card of cards) {
			// Vérifier si le code existe déjà dans la base
			const { data: existingCards, error: fetchError } = await supabase
				.from('cards')
				.select('code')
				.eq('code', card.code);

			if (fetchError) {
				console.error('Error checking existing card:', fetchError.message);
				return new Response(JSON.stringify({ message: fetchError.message }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}

			if (existingCards.length > 0) {
				// Si le code existe déjà, ajouter à la liste des mises à jour
				updateCards.push({
					...card,
					yenPrice: card.yenPrice,
					euroPrice: card.euroPrice,
					euroTaxPrice: card.euroTaxPrice
				});
			} else {
				// Si le code n'existe pas, ajouter à la liste des insertions
				insertCards.push(card);
			}
		}

		// Insérer les nouvelles cartes
		const { data: insertedData, error: insertError } = await supabase
			.from('cards')
			.insert(insertCards);

		if (insertError) {
			console.error('Error inserting data:', insertError.message);
			return new Response(JSON.stringify({ message: insertError.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Mettre à jour les cartes existantes
		for (const card of updateCards) {
			const { error: updateError } = await supabase
				.from('cards')
				.update({
					yenPrice: card.yenPrice,
					euroPrice: card.euroPrice,
					euroTaxPrice: card.euroTaxPrice
				})
				.eq('code', card.code); // Mise à jour basée sur le code

			if (updateError) {
				console.error('Error updating data:', updateError.message);
				return new Response(JSON.stringify({ message: updateError.message }), {
					status: 500,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		return new Response(
			JSON.stringify({
				inserted: insertedData,
				updated: updateCards
			}),
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
