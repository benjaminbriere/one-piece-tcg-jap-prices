import * as dotenv from 'dotenv';

export async function GET() {
	dotenv.config();
	try {
		// Remplacez 'your_table' par le nom réel de votre table dans Supabase
		const response= await fetch(`https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/JPY`);
		const result = await response.json();

		if (!response.ok) {
			console.error('API Exchange rate failed');
			return new Response(JSON.stringify({ message: 'API Exchange rate failed'}), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		return new Response(JSON.stringify(result.conversion_rates.EUR), {
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
