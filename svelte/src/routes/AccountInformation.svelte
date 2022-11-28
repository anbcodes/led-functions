<script lang="ts">
	export let key: string;

	let username: string = '';
	let showKey = false;

	const getUsername = async (key: string) => {
		if (!key) return;
		const res = await fetch(`https://leds.spry.workers.dev/get-username?key=${key}`, {
			method: 'GET'
		});

		const json = await res.json();
		if (json.username) {
			username = json.username;
		} else {
		}
	};

	$: getUsername(key);
</script>

<div class="flex flex-col">
	<div class="flex">
		<div class="mr-4 flex items-center">User: {username}</div>
		<button
			class="rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
			on:click={() => (showKey = !showKey)}>{showKey ? 'Hide' : 'Show'} key</button
		>
	</div>

	{#if showKey}
		<div class="mt-5">Key: {key}</div>
	{/if}
</div>
