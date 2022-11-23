<script lang="ts">
	import { onMount } from 'svelte';
	import { cmds, compile } from './compilier';

	interface Equation {
		value: string;
		compiledValue: number[];
		onChange: () => void;
		error: string;
	}

	interface EquationSet {
		h: Equation;
		s: Equation;
		v: Equation;
		name: string;
		open: boolean;
	}

	let equations: EquationSet[] = [];

	let mounted = false;
	let send = false;

	onMount(() => {
		if (window.location.protocol === 'https:') {
			window.location.protocol = 'http:';
		}

		equations = JSON.parse(localStorage.getItem('equations') || '[]');
		equations.forEach((eq) => {
			eq.h.onChange = onChangeFunc(eq.h, eq);
			eq.s.onChange = onChangeFunc(eq.s, eq);
			eq.v.onChange = onChangeFunc(eq.v, eq);

			eq.h.onChange();
			eq.s.onChange();
			eq.v.onChange();
		});
		send = true;
		mounted = true;

		setTimeout(() => {
			document.querySelectorAll('input').forEach((e) => {
				e.style.width = Math.max(e.value.length + 5, 10) + 'ch';
			});
		});
	});

	$: if (mounted) localStorage.setItem('equations', JSON.stringify(equations));

	let open = false;
	let waiting: NodeJS.Timer;
	const sendToArduino = (eq: { h: Equation; s: Equation; v: Equation }, ishsv = true) => {
		if (!send) return;

		if (eq.h.error || eq.s.error || eq.v.error) return;

		if (open) {
			if (waiting) clearInterval(waiting);
			waiting = setInterval(() => {
				if (!open) {
					sendToArduino(eq, ishsv);
					clearInterval(waiting);
				}
			}, 1);
		}

		const prog_h = new Uint32Array(eq.h.compiledValue);
		const prog_s = new Uint32Array(eq.s.compiledValue);
		const prog_v = new Uint32Array(eq.v.compiledValue);
		const ishsv_arr = new Uint32Array([+ishsv]);
		const sep_arr = new Uint32Array([cmds.END, 0]);

		const socket = new WebSocket('ws://home.anb.codes:13655');
		open = true;
		socket.addEventListener('open', () => {
			console.log('Sending...');

			socket.send(ishsv_arr.buffer);
			console.log(ishsv_arr);

			socket.send(prog_h.buffer);
			console.log(prog_h);

			socket.send(sep_arr.buffer);
			console.log(sep_arr);

			socket.send(prog_s.buffer);
			console.log(prog_s);

			socket.send(sep_arr.buffer);
			console.log(sep_arr);

			socket.send(prog_v.buffer);
			console.log(prog_v);

			socket.send(sep_arr.buffer);
			console.log(sep_arr);

			// socket.close();
		});
		socket.addEventListener('close', () => {
			open = false;
			console.log('closed');
		});
	};

	let currentEq: EquationSet | undefined;

	$: if (currentEq) {
		equations = equations;
	}

	const onChangeFunc = (el: Equation, parent: { h: Equation; s: Equation; v: Equation }) => () => {
		const res = compile(el.value);
		if (res.error) {
			el.error = res.error;
		} else {
			el.error = '';
			el.compiledValue = res.compiled as number[];
		}
		sendToArduino(parent);
		equations = equations;
	};

	const addEquation = () => {
		const el = {
			h: {
				value: '',
				compiledValue: [] as number[],
				onChange: () => {},
				error: ''
			},
			s: {
				value: '',
				compiledValue: [] as number[],
				onChange: () => {},
				error: ''
			},
			v: {
				value: '',
				compiledValue: [] as number[],
				onChange: () => {},
				error: ''
			},
			name: 'New Equation',
			open: true
		};
		el.h.onChange = onChangeFunc(el.h, el);
		el.s.onChange = onChangeFunc(el.s, el);
		el.v.onChange = onChangeFunc(el.v, el);

		el.h.onChange();
		el.s.onChange();
		el.v.onChange();

		equations.forEach((v) => (v.open = false));
		equations.push(el);
		equations = equations;
	};

	const removeEquation = (eq: { h: Equation; s: Equation; v: Equation }) => {
		equations = equations.filter((v) => v !== eq);
	};

	let confirmDelete = false;
</script>

<header class="pb-10 p-5">
	<h1 class="text-5xl ">LEDS</h1>
</header>

<div class="p-4 font-sans flex">
	<div
		class="md:flex flex-col flex-shrink-0 text-2xl w-full md:w-[300px] md:border-r border-gray-800 border-solid pr-4"
		class:hidden={currentEq}
		class:flex={!currentEq}
	>
		{#each equations as eq, i}
			<button
				class="border-gray-800 p-2 mx-2 border-solid border-b {eq === currentEq
					? ''
					: 'hover:bg-gray-200'} active:bg-gray-300"
				class:bg-gray-300={eq === currentEq}
				class:border-t={i === 0}
				on:click={() => {
					currentEq = eq;
					sendToArduino(currentEq);
				}}
			>
				{eq.name}</button
			>
		{/each}
		<button
			class="mt-14 rounded border-gray-800 border-solid border py-4 hover:bg-gray-200 active:bg-gray-300"
			on:click={addEquation}
		>
			Add equation
		</button>
	</div>

	<div class="pl-5 flex-grow">
		{#if currentEq}
			<div class="flex justify-between">
				<button
					class="text-base md:hidden rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300"
					on:click={() => {
						currentEq = undefined;
					}}
				>
					Back
				</button>
				<div class="flex md:flex-row-reverse">
					{#if confirmDelete}
						<button
							class="text-base rounded border-green-800 text-green-800 border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300"
							on:click={() => {
								confirmDelete = false;
								if (currentEq) removeEquation(currentEq);
								currentEq = undefined;
							}}
						>
							Confirm Delete
						</button>
						<button
							class="text-base rounded border-red-800 text-red-800 border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300"
							on:click={() => (confirmDelete = false)}
						>
							Cancel Delete
						</button>
					{:else}
						<button
							class="text-base rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300"
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
				bind:value={currentEq.name}
			/>
			<div class="pl-10">
				<div class="flex whitespace-nowrap py-2">
					<label for="h">h = </label><input
						name="h"
						class="pl-4 font-mono focus:outline-none w-full"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						bind:value={currentEq.h.value}
						on:input={currentEq.h.onChange}
					/>
				</div>
				<pre class="h-0 invisible">    {currentEq.h.value}</pre>
				<pre>{currentEq.h.error}</pre>
				<div class="flex whitespace-nowrap py-2">
					<label for="s">s = </label><input
						name="s"
						class="pl-4 font-mono focus:outline-none w-full"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						bind:value={currentEq.s.value}
						on:input={currentEq.s.onChange}
					/>
				</div>
				<pre class="h-0 invisible">    {currentEq.s.value}</pre>
				<pre>{currentEq.s.error}</pre>
				<div class="flex whitespace-nowrap py-2">
					<label for="v">v = </label><input
						name="v"
						class="pl-4 font-mono focus:outline-none w-full"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						bind:value={currentEq.v.value}
						on:input={currentEq.v.onChange}
					/>
				</div>
				<pre>{currentEq.v.error}</pre>
				<pre class="h-0 invisible">    {currentEq.v.value}</pre>
			</div>
		{/if}
	</div>
</div>

<div class="mistvideo" id="live_RDhIpDwdElfL">
	<noscript>
		<a href="http://home.anb.codes:48080/live.html" target="_blank" rel="noreferrer">
			Click here to play this video
		</a>
	</noscript>
	<script>
		var a = function () {
			window.mainvideo = mistPlay('live', {
				target: document.getElementById('live_RDhIpDwdElfL'),
				muted: true,
				urlappend: '?video=lowbps,lowres&audio=lowbps',
				forcePriority: {
					source: [['type', ['webrtc']]]
				},
				monitor: {
					action: () => {}
				}
			});
		};
		if (!window.mistplayers) {
			var p = document.createElement('script');
			p.src = 'http://home.anb.codes:48080/player.js';
			document.head.appendChild(p);
			p.onload = a;
		} else {
			a();
		}
	</script>
</div>

<div class="p-4 flex flex-col">
	<button
		class="text-1xl mt-20 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => location.reload()}
	>
		Reload Page
	</button>
</div>
