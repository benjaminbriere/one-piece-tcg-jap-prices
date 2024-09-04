<script lang="ts">
	import {
		ArrowRightOutline,
		ChartLineDownOutline,
		ChartLineUpOutline
	} from 'flowbite-svelte-icons';

	export let euroTaxPrice: number | undefined | null;
	export let previousTaxPrice: number | undefined | null;

	let IconComponent = ArrowRightOutline; // Icône par défaut
	let iconColor = 'text-gray-500'; // Couleur par défaut

	// Définir la valeur maximale pour les différences absolues significatives
	const maxDifference = 10;

	// Fonction pour mettre à jour l'icône et la couleur en fonction des prix
	function updateIcon() {
		if (
			typeof euroTaxPrice === 'number' &&
			typeof previousTaxPrice === 'number' &&
			previousTaxPrice !== 0
		) {
			const priceDifference = euroTaxPrice - previousTaxPrice;
			const absoluteDifference = Math.abs(priceDifference);
			const percentageDifference = (priceDifference / previousTaxPrice) * 100;

			if (priceDifference > 0) {
				IconComponent = ChartLineUpOutline;
				if (percentageDifference > 10 || absoluteDifference > maxDifference) {
					iconColor = 'text-red-600'; // Différence significative > 10%
				} else if (percentageDifference > 5) {
					iconColor = 'text-red-400'; // Différence moyenne 5-10%
				} else {
					iconColor = 'text-red-300'; // Faible différence 0-5%
				}
			} else if (priceDifference < 0) {
				IconComponent = ChartLineDownOutline;
				if (percentageDifference < -10 || absoluteDifference > maxDifference) {
					iconColor = 'text-green-600'; // Différence significative < -10%
				} else if (percentageDifference < -5) {
					iconColor = 'text-green-400'; // Différence moyenne -5 à -10%
				} else {
					iconColor = 'text-green-300'; // Faible différence 0 à -5%
				}
			} else {
				IconComponent = ArrowRightOutline;
				iconColor = 'text-gray-500'; // Stable
			}
		} else {
			IconComponent = ArrowRightOutline;
			iconColor = 'text-gray-500'; // Pas d'ancien prix ou stable
		}
	}

	// Utiliser une déclaration réactive pour mettre à jour l'icône chaque fois que les propriétés changent
	$: updateIcon();
</script>

<!-- Utilisation de l'icône avec la couleur appropriée -->
<IconComponent class={`h-6 w-6 ${iconColor}`} />
