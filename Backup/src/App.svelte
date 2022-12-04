<script>
	export let name;
	import Navbar from './Navbar.svelte'
	import Sidebar from './Sidebar.svelte'
	import Main from './Main.svelte'

	let open = false
</script>

<Sidebar bind:open/>
<Navbar bind:sidebar={open}/>

<svelte:head>
	<link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet"/>
</svelte:head>

<main>
	<h1>Welcome {name}!</h1>
	<p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p>
	<p>Visit the <a href="https://google.com">Google</a> Test.</p>
</main>

<style>
    :global(body) {
		padding: 0;
	}
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>