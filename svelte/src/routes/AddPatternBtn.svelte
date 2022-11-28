<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Pattern } from './types';
	import { generateRandomId } from './util';

	export let disabled: boolean = false;

	const emit = createEventDispatcher<{ newPattern: Pattern }>();

	const addPattern = () => {
		emit('newPattern', {
			name: 'New Pattern',
			h: '',
			s: '',
			v: '',
			id: generateRandomId()
		});
	};
</script>

<button
	class="mt-14 rounded border-gray-800 border-solid border py-4 hover:bg-gray-200 active:bg-gray-300 disabled:hover:bg-white disabled:border-gray-500 disabled:text-gray-500"
	on:click={addPattern}
	{disabled}
>
	Add Pattern
</button>
