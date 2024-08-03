import { supabase } from "$lib/supabaseClient";

export async function GET() {
  try {
    // Remplacez 'your_table' par le nom réel de votre table dans Supabase
    const { data, error } = await supabase
      .from('cards')
      .select('*');

    if (error) {
      console.error('Error fetching data from Supabase:', error.message);
      return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ message: 'Unexpected error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}