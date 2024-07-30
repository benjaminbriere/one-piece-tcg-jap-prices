<script>
    import { Spinner } from 'flowbite-svelte';
  </script>

<div class="absolute-container">
  <Spinner />
</div>

<style>
  .absolute-container{
    width: 100vw;
    height: 100vh;
    position: relative;
    top: 0;
    left: 0;
    z-index: 1000;
    background-color: rgba(50,50,50,0.3);
    display: flex;
    justify-content: center;
  }
</style>