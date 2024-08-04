import { supabase } from '$lib/supabaseClient';

export async function POST({ request }) {
	try {
		const { id, name, op01, op02, op03, op04, op05, op06, op07, op08, op09, prb01 } =
			await request.json();

		// Assurez-vous que les données sont valides
		if (!id || !name) {
			return new Response(JSON.stringify({ message: 'ID and name are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Met à jour la configuration dans Supabase
		const { data, error } = await supabase
			.from('configurations')
			.update({ name, op01, op02, op03, op04, op05, op06, op07, op08, op09, prb01 })
			.eq('id', id);

		if (error) {
			throw error;
		}

		return new Response(JSON.stringify({ data }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (err) {
		console.error('Error updating configuration:', err);
		return new Response(JSON.stringify({ message: 'Unexpected error occurred' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
