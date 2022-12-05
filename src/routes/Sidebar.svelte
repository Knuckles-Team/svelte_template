<script>
	export let open = false
</script>

<aside class="absolute w-full h-full me-auto bg-gray-200 border-r-2 shadow-lg" class:open>
	<nav class="p-12 text-xl">
	  <a class="block" href="/">Home</a>
		<a class="block" href="/about">About</a>
		<a class="block" href="/contact">Contact</a>
	</nav>
</aside>

<style>
	aside {
		left: -100%;
		transition: left 0.3s ease-in-out
	}

	.open {
		left: -80%;
		text-align: right;
		padding-right: 50;
		background-color: var(--color-bg-white);
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}
</style>