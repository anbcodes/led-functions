<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { compile } from './compilier';
	import type { Pattern } from './types';
	import { generateRandomId } from './util';

	export let patterns: Pattern[];
	export let currentPatternId: string;
	export let disabled: boolean = false;

	let currentPattern: Pattern;
	$: currentPattern = patterns.find((v) => v.id === currentPatternId) as Pattern;
	$: if (currentPattern) checkForErrors();

	let emit = createEventDispatcher<{
		close: undefined;
		edit: Pattern;
		newPattern: Pattern;
		remove: Pattern;
	}>();

	let confirmDelete = false;

	let equationTypes = ['h', 's', 'v'] as ('h' | 's' | 'v')[];

	const errors = {
		h: '',
		s: '',
		v: ''
	};

	let emitTimeout: NodeJS.Timeout;

	const checkForErrors = () => {
		if (!currentPattern) return;

		for (let type of equationTypes) {
			const { error } = compile(currentPattern[type]);
			if (error) {
				errors[type] = error;
			} else {
				errors[type] = '';
			}
		}
	};

	const onEdit = () => {
		if (!currentPattern) return;

		checkForErrors();

		clearTimeout(emitTimeout);
		emitTimeout = setTimeout(() => emit('edit', currentPattern), 500);
	};
</script>

<div class="flex flex-col">
	{#if currentPattern}
		<div class="flex justify-between">
			<button
				class="text-base md:hidden rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300"
				on:click={() => emit('close')}
			>
				Back
			</button>
			<div class="flex md:flex-row-reverse">
				<button
					class="text-base rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300 mx-2"
					on:click={() => emit('newPattern', { ...currentPattern, id: generateRandomId() })}
				>
					Clone
				</button>
				{#if confirmDelete}
					<button
						class="text-base rounded border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300"
						on:click={() => {
							confirmDelete = false;
							emit('remove', currentPattern);
						}}
					>
						Confirm Delete
					</button>
					<button
						class="text-base rounded border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300"
						on:click={() => (confirmDelete = false)}
					>
						Cancel Delete
					</button>
				{:else}
					<button
						class="text-base rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300 disabled:hover:bg-white disabled:border-gray-500 disabled:text-gray-500"
						{disabled}
						on:click={() => (confirmDelete = true)}
					>
						Delete
					</button>
				{/if}
			</div>
		</div>

		<input
			type="text"
			class="focus:outline-none text-2xl w-full py-3"
			{disabled}
			bind:value={currentPattern.name}
			on:input={onEdit}
		/>
		<div class="pl-10">
			{#each equationTypes as type}
				<div class="flex whitespace-nowrap py-2">
					<label for={type}>{type} = </label><input
						name={type}
						class="pl-4 font-mono focus:outline-none w-full"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						{disabled}
						bind:value={currentPattern[type]}
						on:input={onEdit}
					/>
				</div>
				<pre class="h-0 invisible">{currentPattern[type]}</pre>
				<pre>{errors[type]}</pre>
			{/each}
		</div>
	{/if}
</div>
