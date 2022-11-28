<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { Pattern } from './types';

	let viewUsername = '';
	let viewUsernameError = '';

	let users: string[] = [];

	const emit = createEventDispatcher<{ view: Pattern[] }>();

	onMount(async () => {
		const res = await fetch('https://leds.spry.workers.dev/users');

		users = await res.json();

		console.log(users);
	});

	const updateViewUser = async () => {
		if (!users.includes(viewUsername)) {
			viewUsernameError = 'User does not exist';
			emit('view', []);
			return;
		}

		const res = await fetch(`https://leds.spry.workers.dev/data?username=${viewUsername}`);
		const json = await res.json();

		if (json.data) {
			emit('view', JSON.parse(json.data)?.patterns ?? []);
			viewUsernameError = '';
		} else {
			emit('view', []);
			viewUsernameError = '';
		}
	};

	let updateViewUserTimeout: NodeJS.Timeout;
	const onUsernameInput = () => {
		clearTimeout(updateViewUserTimeout);
		updateViewUserTimeout = setTimeout(updateViewUser, 500);
	};
</script>

<div>
	<label for="view-user">View user</label>
	<input
		name="view-user"
		class="ml-4 border border-gray-800 border-solid rounded px-1"
		placeholder="username"
		type="search"
		list="users"
		bind:value={viewUsername}
		on:input={onUsernameInput}
	/>
	<datalist id="users">
		{#each users as user}
			<option value={user} />{/each}
	</datalist>
</div>
<div class="text-sm text-red-800">{viewUsernameError}</div>
