<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>


<section>
	<div class="text-column">
    <h1>Contact Us</h1>

    <p>
      This is a <a href="https://kit.svelte.dev">SvelteKit</a> app. You can make your own by typing the
      following into your command line and following the prompts:
    </p>

    <pre>npm create svelte@latest</pre>

    <p>
      The page you're looking at is purely static HTML, with no client-side interactivity needed.
      Because of that, we don't need to load any JavaScript. Try viewing the page's source, or opening
      the devtools network panel and reloading.
    </p>

  </div>
</section>

<style>
	section {
	  max-width: 100%;
		display: flex;
		flex-direction: column;
		flex: 0.9;
		background-color: #ffffff;
		box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
	}

	h1 {
		width: 100%;
	}

</style>
