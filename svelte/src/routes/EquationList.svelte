<script lang="ts">
	import type { Pattern } from './types';

	export let patterns: Pattern[];
	export let currentPatternId: string;
</script>

{#each patterns as pattern, i}
	<button
		class:border-t={i === 0}
		class="{currentPatternId != pattern.id
			? 'hover:bg-gray-200'
			: 'bg-gray-300'} border-gray-800 p-2 mx-2 border-solid border-b active:bg-gray-300"
		on:click={() => (currentPatternId = pattern.id)}
	>
		{pattern.name}</button
	>
{/each}
