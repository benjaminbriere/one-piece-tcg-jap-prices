import { supabase } from '$lib/supabaseClient';

export async function GET({ url }) {
	try {
		// Récupérer le paramètre d'extension de l'URL
		const extension = url.searchParams.get('extension');

		if (!extension) {
			return new Response(JSON.stringify({ message: 'Missing extension parameter' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Requête pour récupérer les cartes pour une extension particulière
		const { data, error } = await supabase
			.from('cards')
			.select('*')
			.eq('extension', extension)
			.order('code');

		if (error) {
			console.error('Error fetching data from Supabase:', error.message);
			return new Response(JSON.stringify({ message: error.message }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		return new Response(JSON.stringify(data), {
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
