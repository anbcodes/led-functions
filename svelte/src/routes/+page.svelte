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

	let iframe: HTMLIFrameElement;

	onMount(() => {
		if (iframe) iframe.height = `${Math.min(600, (iframe.clientWidth / 16) * 9)}`;
		addEventListener('resize', () => {
			if (iframe) iframe.height = `${Math.min(600, (iframe.clientWidth / 16) * 9)}`;
		});

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

		const socket = new WebSocket('wss://home.anb.codes:13655');
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

<div>
	<iframe
		title="stream"
		src="https://player.twitch.tv/?channel=anbcodes&parent={mounted
			? window.location.hostname
			: 'leds.anb.codes'}"
		frameborder="0"
		allowfullscreen={true}
		scrolling="no"
		class="w-full"
		bind:this={iframe}
	/>
</div>

<div class="p-4 mt-20 prose">
	<h1>Usage</h1>
	<p>Add sets of equations using the "Add Equation" button.</p>
	<p>
		Each set of equations contains an "h" equation, an "s" equation, and a "v" equation. Each
		equation corresponds to each part of the <a href="https://en.wikipedia.org/wiki/HSL_and_HSV">HSV color</a> of the LED.
	</p>
	<p>
		Each equation is run every frame for every LED on the led strip, which allows you to create a
		LED pattern by using the equations.
	</p>
	<p>
		The equations look like normal math equations, for example, setting <code>h = i + t</code> and
		<code>s = 255</code>
		and <code>v = 90</code> will create a rainbow pattern across the led strip.
	</p>
	<p>
		All numbers are integers and the values sent to the LEDs are mod 256 of the result of the
		equations. You can access two variables: <code>i</code> and <code>t</code>. <code>i</code> is
		the index of the LED and <code>t</code> is the current frame, which increments by 1 every frame.
	</p>
	<p>
		I attempted to have expressions evaluated according to the order of operations, but I don't
		think I got it quite working, so I recommend using parenthesis if something doesn't seem right.
	</p>
	<p>
		There are two functions that you can use. The first one is <code
			>if([expr], [if not 0], [if 0])
		</code>, which should be self-explanatory. The other one is <code>sin([value])</code>, which
		computes the sin of a value, but a full cycle is 0-255 instead of 0-2pi.
	</p>
	<p>
		The video is a live stream of my LED lights running whatever equations are written here. If too
		many people use this, it could get crazy. When you type in an equation, it is automatically sent
		to the LED strip.
	</p>
	<p>
		This was a random project that I wanted to try. I'll probably set a password on it at some
		point, but I thought I'd let the whole world try it out first. It probably has a lot of bugs and
		I'm not planning to fix them all. I also wrote a <a href="https://anb.codes/2022/led-equations"
			>blog post</a
		> explaining how everything works.
	</p>
</div>

<div class="p-4 flex flex-col">
	<button
		class="text-1xl mt-20 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => location.reload()}
	>
		Reload Page
	</button>
</div>
