<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const emit = createEventDispatcher<{ click: undefined }>();
</script>

<div>
	<button
		class="rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => emit('click')}
	>
		New Account
	</button>
	<div>Note: Backup your current key first!</div>
</div>
