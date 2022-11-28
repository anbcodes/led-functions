<script lang="ts">
	export let LEDPassword: [string, string];

	let showLEDPass = false;
</script>

<div>
	LEDs Password
	<div class="m-3">
		<label for="p1">Part 1</label>
		{#if showLEDPass}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p1"
				type="text"
				bind:value={LEDPassword[0]}
			/>
		{:else}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p1"
				type="password"
				bind:value={LEDPassword[0]}
			/>
		{/if}
	</div>
	<div class="m-3">
		<label for="p2">Part 2</label>
		{#if showLEDPass}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p2"
				type="text"
				bind:value={LEDPassword[1]}
			/>
		{:else}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p2"
				type="password"
				bind:value={LEDPassword[1]}
			/>
		{/if}
	</div>
	<div>
		<button
			class="text-1xl mt-2 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
			on:click={() => (showLEDPass = !showLEDPass)}>{showLEDPass ? 'Hide' : 'Show'}</button
		>
	</div>
</div>
