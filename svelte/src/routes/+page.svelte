<script lang="ts">
	import { onMount } from 'svelte';
	import { cmds, compile } from './compilier';

	interface Equation {
		value: string;
		compiledValue: number[];
		onChange: () => void;
		error: string;
	}

	let equations: {
		h: Equation;
		s: Equation;
		v: Equation;
		name: string;
		open: boolean;
	}[] = [];

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
</script>

<div class="p-4 font-sans">
	<h1 class="text-5xl">LEDS</h1>

	{#each equations as eq}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<details
			class="pl-10 py-5 font-mono text-xl"
			bind:open={eq.open}
			on:click={() => {
				console.log(equations);
				if (!eq.open) {
					sendToArduino(eq);
					equations.filter((v) => v !== eq).forEach((v) => (v.open = false));
					setTimeout(() => (eq.open = true), 0);
					equations = equations;
				}
			}}
		>
			<summary
				><input
					type="text"
					class="focus:outline-none text-2xl font-mono resize-x"
					bind:value={eq.name}
					on:input={(e) => {
						// @ts-ignore
						if (e.target) e.target.style.width = Math.max(eq.s.value.length + 5, 10) + 'ch';
						eq.s.onChange();
					}}
				/></summary
			>

			<div class="pl-10">
				<div class="flex whitespace-nowrap">
					<label for="h">h = </label><input
						name="h"
						class="pl-4 font-mono focus:outline-none resize-x"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						bind:value={eq.h.value}
						on:input={(e) => {
							// @ts-ignore
							if (e.target) e.target.style.width = Math.max(eq.h.value.length + 5, 10) + 'ch';
							eq.h.onChange();
						}}
					/>
				</div>
				<pre>{eq.h.error}</pre>
				<div class="flex whitespace-nowrap">
					<label for="s">s = </label><input
						name="s"
						class="pl-4 font-mono focus:outline-none resize-x"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						bind:value={eq.s.value}
						on:input={(e) => {
							// @ts-ignore
							if (e.target) e.target.style.width = Math.max(eq.s.value.length + 5, 10) + 'ch';
							eq.s.onChange();
						}}
					/>
				</div>
				<pre>{eq.s.error}</pre>
				<div class="flex whitespace-nowrap">
					<label for="v">v = </label><input
						name="v"
						class="pl-4 font-mono focus:outline-none resize-x"
						type="text"
						autocomplete="off"
						autocorrect="off"
						autocapitalize="off"
						spellcheck="false"
						bind:value={eq.v.value}
						on:input={(e) => {
							// @ts-ignore
							if (e.target) e.target.style.width = Math.max(eq.v.value.length + 5, 10) + 'ch';
							eq.h.onChange();
						}}
					/>
				</div>
				<pre>{eq.v.error}</pre>
				<button
					class="mt-4 text-2xl font-sans rounded border-gray-800 border-solid border w-48 py-4 hover:bg-gray-200 active:bg-gray-300"
					on:click={() => removeEquation(eq)}>Delete</button
				>
			</div>
		</details>
	{/each}

	<div class="flex flex-col">
		<button
			class="text-2xl mt-14 rounded border-gray-800 border-solid border w-48 py-4 hover:bg-gray-200 active:bg-gray-300"
			on:click={addEquation}
		>
			Add equation
		</button>
		<button
			class="text-2xl mt-14 rounded border-gray-800 border-solid border w-48 py-4 hover:bg-gray-200 active:bg-gray-300"
			on:click={() => location.reload()}
		>
			Reload
		</button>
	</div>
</div>
