<script lang="ts">
	import { onMount } from 'svelte';
	import { Chart } from 'chart.js/auto';

	interface PriceHistory {
		price: number;
		date: Date;
	}

	export let historyPrice: PriceHistory[] = [];

	let canvas: HTMLCanvasElement;

	onMount(() => {
		if (historyPrice.length > 0) {
			const labels = historyPrice.map((item) => new Date(item.date).toLocaleDateString());
			const data = historyPrice.map((item) => item.price);

			new Chart(canvas, {
				type: 'line',
				data: {
					labels,
					datasets: [
						{
							label: 'Historique des prix',
							data,
							borderColor: 'rgb(75, 192, 192)',
							fill: false,
							tension: 0.1
						}
					]
				},
				options: {
					scales: {
						x: {
							title: {
								display: true,
								text: 'Date'
							}
						},
						y: {
							title: {
								display: true,
								text: 'Prix TTC (€)'
							},
							beginAtZero: false
						}
					}
				}
			});
		}
	});
</script>

<canvas bind:this={canvas} width="400" height="200"></canvas>

<style>
	canvas {
		max-width: 100%;
		background-color: white;
		height: auto;
	}
</style>
