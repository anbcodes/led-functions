<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let keyError = '';
	let newKey = '';

	const emit = createEventDispatcher<{ newKey: string }>();

	const setKey = async () => {
		if (newKey.length !== 25) {
			keyError = 'Key must be 25 characters long';
			return;
		}

		const res = await fetch(`https://leds.spry.workers.dev/get-username?key=${newKey}`, {
			method: 'GET'
		});

		const json = await res.json();
		if (json.username) {
			emit('newKey', newKey);
			keyError = '';
			newKey = '';
		} else {
			keyError = json.error;
		}
	};
</script>

<div class="flex">
	<label for="key">Key</label>
	<input
		class="ml-4 border border-gray-800 border-solid rounded px-1"
		name="key"
		bind:value={newKey}
	/>
</div>
<div class="text-sm text-red-800">{keyError}</div>
<button
	class="rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"
	on:click={() => setKey()}
>
	Set Key
</button>
<div>
	Note: Setting the key allows you to change accounts (remember to save your old key somewhere!)
</div>
