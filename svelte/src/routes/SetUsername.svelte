<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let key: string;

	const emit = createEventDispatcher<{ update: undefined }>();

	let newUsername = '';
	let usernameError = '';

	const setUsername = async () => {
		if (newUsername === '') return;

		const res = await fetch(
			`https://leds.spry.workers.dev/set-username?key=${key}&username=${newUsername}`,
			{ method: 'POST' }
		);
		const json = await res.json();
		if (json.success) {
			emit('update');
			usernameError = '';
			newUsername = '';
		} else {
			usernameError = json.error;
		}
	};
</script>

<div class="flex flex-col">
	<div class="flex">
		<label for="username">Username</label>
		<input
			class="ml-4 border border-gray-800 border-solid rounded px-1"
			name="username"
			bind:value={newUsername}
		/>
	</div>
	<div class="text-sm text-red-800">{usernameError}</div>
	<button
		class="rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => setUsername()}
	>
		Set Username
	</button>
</div>
