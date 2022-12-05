<script>
	import Logo from './Logo.svelte'
	import Hamburger from './Hamburger.svelte'
	import Menu from './Menu.svelte'

	export let sidebar = false
</script>

<header class="flex justify-between bg-gray-200 p-2 items-center text-gray-600 border-b-2">
	<nav class="flex">
		<Hamburger bind:open={sidebar}/>
		<Logo/>
	</nav>

	<Menu/>
</header>

<style>
	nav {
		background-color: var(--color-bg-white);
	}

	header {
		background-color: var(--color-bg-white);
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}

</style>