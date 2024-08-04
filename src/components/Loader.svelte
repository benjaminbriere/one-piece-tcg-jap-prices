<script>
	import { Spinner } from 'flowbite-svelte';
</script>

<div id="absolute-container">
	<div class="flex flex-col justify-center">
		<Spinner />
	</div>

</div>

<style>
	#absolute-container {
		width: 100vw;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 1000;
		background-color: rgba(50, 50, 50, 0.3);
		display: flex;
		justify-content: center;
	}
</style>
