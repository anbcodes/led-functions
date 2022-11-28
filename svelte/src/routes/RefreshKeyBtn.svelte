<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let key: string;

	let refreshKeyConfirm = false;

	const emit = createEventDispatcher<{ newKey: string }>();

	const refreshKey = async () => {
		refreshKeyConfirm = false;

		const res = await fetch(`https://leds.spry.workers.dev/new-pass?key=${key}`, {
			method: 'POST'
		});

		const json = await res.json();

		if (json.key) {
			emit('newKey', json.key);
		}
	};
</script>

<div>
	{#if refreshKeyConfirm}
		<div class="flex">
			<button
				class="rounded border-gray-800 border-solid border w-36 py-2 mr-4 hover:bg-gray-200 active:bg-gray-300"
				on:click={() => {
					refreshKeyConfirm = false;
				}}
			>
				Cancel
			</button>
			<button
				class="rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
				on:click={refreshKey}
			>
				Confirm
			</button>
		</div>
		<div>Note: Refreshing your key logs you out of all devices</div>
	{:else}
		<button
			class="rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
			on:click={() => (refreshKeyConfirm = true)}
		>
			Refresh Key
		</button>
	{/if}
</div>
