<script lang="ts">
	import { onMount } from 'svelte';
	import { cmds, compile } from './compilier';
	import { simulate } from './simulator';

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
	let myEquations: EquationSet[] = [];

	let password_p1 = '';
	let password_p2 = '';

	let showLEDPass = false;

	let username = '';
	let key = '';

	let viewUsername = '';
	let viewUsernameError = '';

	let currentlySimulating: EquationSet = equations[0];

	let mounted = false;
	let send = false;

	$: if (mounted) localStorage.setItem('password_p1', password_p1);
	$: if (mounted) localStorage.setItem('password_p2', password_p2);

	let simulationCanvas: HTMLCanvasElement;

	let dataInitialized = false;

	const getData = async (forUser: string) => {
		const res = await fetch(`https://leds.spry.workers.dev/data?username=${forUser}`);
		const resJson = await res.json();
		if (resJson.error) return resJson.error as string;
		const json = JSON.parse(resJson.data);
		if (!json.equations) json.equations = [];
		json.equations.forEach((eq: EquationSet) => {
			eq.h.onChange = onChangeFunc(eq.h, eq);
			eq.s.onChange = onChangeFunc(eq.s, eq);
			eq.v.onChange = onChangeFunc(eq.v, eq);

			eq.h.onChange();
			eq.s.onChange();
			eq.v.onChange();
		});
		equations = json.equations;
		if (forUser === username) {
			myEquations = json.equations;
			viewUsername = '';
		}

		dataInitialized = true;
	};

	const getUsername = async () => {
		const res = await fetch(`https://leds.spry.workers.dev/get-username?key=${key}`, {
			method: 'GET'
		});

		const json = await res.json();
		if (json.username) {
			username = json.username;
			localStorage.setItem('username', username);
		} else {
			username = 'Not logged in';
		}
	};

	onMount(() => {
		if (simulationCanvas) simulationCanvas.width = simulationCanvas.clientWidth;
		addEventListener('resize', () => {
			if (simulationCanvas) simulationCanvas.width = simulationCanvas.clientWidth;
		});

		viewUsername = new URLSearchParams(location.search).get('view') ?? '';
		window.addEventListener('popstate', () => {
			viewUsername = new URLSearchParams(location.search).get('view') ?? '';
		});

		username = localStorage.getItem('username') ?? '';
		key = localStorage.getItem('key') ?? '';

		if (!username || !key) {
			fetch('https://leds.spry.workers.dev/new-user', {
				method: 'POST'
			})
				.then((v) => v.json())
				.then((v) => {
					username = v.username;
					localStorage.setItem('username', username);
					key = v.key;
					localStorage.setItem('key', key);
				})
				.then(() => getData(username));
		} else {
			getUsername();
			getData(username);
		}

		password_p1 = localStorage.getItem('password_p1') ?? '0';
		password_p2 = localStorage.getItem('password_p2') ?? '0';

		send = true;
		mounted = true;

		const ctx = simulationCanvas.getContext('2d');

		if (!ctx) throw new Error('No canvas context!');

		setInterval(() => {
			if (currentlySimulating && simulationCanvas) {
				simulate(
					simulationCanvas,
					ctx,
					currentlySimulating.h.compiledValue,
					currentlySimulating.s.compiledValue,
					currentlySimulating.v.compiledValue
				);
			}
		}, 1000 / 40);
	});

	const setEquations = async (equations: EquationSet[], force = false) => {
		if (!username) return;
		if (!mounted) return;
		if (viewUsername && !force) return;

		await fetch(`https://leds.spry.workers.dev/data?key=${key}&username=${username}`, {
			method: 'PUT',
			body: JSON.stringify({
				equations
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	let tryUsernameTimeout: NodeJS.Timeout;
	const tryUsername = (user: string) => {
		if (!mounted) return;
		if (tryUsernameTimeout) clearTimeout(tryUsernameTimeout);
		tryUsernameTimeout = setTimeout(async () => {
			if (!user) {
				viewUsernameError = '';
				console.log('No user', user);
				history.pushState(null, '', '/');
				await getData(username);
				return;
			}

			const error = await getData(user);
			if (error) {
				viewUsernameError = error;
			} else {
				viewUsernameError = '';
			}

			history.pushState(null, '', `?view=${user}`);
		}, 500);
	};

	$: if (mounted) tryUsername(viewUsername);

	let open = false;
	let waiting: NodeJS.Timer;
	const sendToArduino = (eq: EquationSet, ishsv = true) => {
		if (!send) return;

		if (eq.h.error || eq.s.error || eq.v.error) return;

		if (!+password_p1 || !+password_p2) return;

		if (open) {
			if (waiting) clearInterval(waiting);
			waiting = setInterval(() => {
				if (!open) {
					sendToArduino(eq, ishsv);
					clearInterval(waiting);
				}
			}, 1);
			return;
		}

		currentlySimulating = eq;

		const password_arr = new Uint32Array([+password_p1, +password_p2]);
		const prog_h = new Uint32Array(eq.h.compiledValue);
		const prog_s = new Uint32Array(eq.s.compiledValue);
		const prog_v = new Uint32Array(eq.v.compiledValue);
		const ishsv_arr = new Uint32Array([+ishsv]);
		const sep_arr = new Uint32Array([cmds.END, 0]);

		const socket = new WebSocket('wss://home.anb.codes:13655');
		open = true;
		socket.addEventListener('open', () => {
			console.log('Sending...');

			socket.send(password_arr.buffer);
			socket.send(ishsv_arr.buffer);
			socket.send(prog_h.buffer);
			socket.send(sep_arr.buffer);
			socket.send(prog_s.buffer);
			socket.send(sep_arr.buffer);
			socket.send(prog_v.buffer);
			socket.send(sep_arr.buffer);
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

	let updateServerTimeout: NodeJS.Timeout;

	const onChangeFunc = (el: Equation, parent: EquationSet) => () => {
		if (!dataInitialized) return;

		const res = compile(el.value);
		if (res.error) {
			el.error = res.error;
		} else {
			el.error = '';
			el.compiledValue = res.compiled as number[];
		}
		sendToArduino(parent);

		if (updateServerTimeout) clearTimeout(updateServerTimeout);

		console.log('Attempt send', equations);

		updateServerTimeout = setTimeout(() => setEquations(equations), 500);

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

		equations.push(el);
		equations = equations;
		setEquations(equations);
	};

	const removeEquation = (eq: { h: Equation; s: Equation; v: Equation }) => {
		equations = equations.filter((v) => v !== eq);
	};

	const cloneEquation = (eq: EquationSet) => {
		const newEquation = {
			h: {
				value: eq.h.value,
				compiledValue: [] as number[],
				onChange: () => {},
				error: ''
			},
			s: {
				value: eq.s.value,
				compiledValue: [] as number[],
				onChange: () => {},
				error: ''
			},
			v: {
				value: eq.v.value,
				compiledValue: [] as number[],
				onChange: () => {},
				error: ''
			},
			name: eq.name,
			open: true
		};
		newEquation.h.onChange = onChangeFunc(newEquation.h, newEquation);
		newEquation.s.onChange = onChangeFunc(newEquation.s, newEquation);
		newEquation.v.onChange = onChangeFunc(newEquation.v, newEquation);

		newEquation.h.onChange();
		newEquation.s.onChange();
		newEquation.v.onChange();
		equations = myEquations;
		viewUsername = '';
		currentEq = undefined;
		equations.push(newEquation);
		setEquations(equations);
		equations = equations;
	};

	let confirmDelete = false;

	let showKey = false;

	let refreshKeyConfirm = false;

	let newKey = '';
	let keyError = '';

	let newUsername = '';
	let usernameError = '';

	const setKey = async () => {
		if (newKey.length !== 25) {
			keyError = 'Key must be 25 characters long';
			return;
		}

		const res = await fetch(`https://leds.spry.workers.dev/get-username?key=${key}`, {
			method: 'GET'
		});

		const json = await res.json();
		if (json.username) {
			key = newKey;
			username = json.username;
			getData(username);
			keyError = '';
			newKey = '';
			localStorage.setItem('key', key);
			localStorage.setItem('username', username);
		} else {
			keyError = json.error;
		}
	};

	const refreshKey = async () => {
		refreshKeyConfirm = false;
		const res = await fetch(`https://leds.spry.workers.dev/new-pass?key=${key}`, {
			method: 'POST'
		});
		const json = await res.json();
		if (json.key) {
			key = json.key;
			localStorage.setItem('key', key);
		}
	};

	const setUsername = async () => {
		if (newUsername === '') return;

		const res = await fetch(
			`https://leds.spry.workers.dev/set-username?key=${key}&username=${newUsername}`,
			{ method: 'POST' }
		);
		const json = await res.json();
		if (json.success) {
			username = newUsername;
			usernameError = '';
			newUsername = '';

			localStorage.setItem('username', username);
		} else {
			usernameError = json.error;
		}
	};

	const newAccount = () => {
		localStorage.removeItem('username');
		localStorage.removeItem('key');
		location.reload();
	};
</script>

<header class="pb-10 p-5 flex justify-between flex-col md:flex-row">
	<h1 class="text-5xl ">LEDS</h1>
	<div class="flex flex-col">
		<div class="flex">
			<div class="mr-4 flex items-center">{username}</div>
			<button
				class="rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
				on:click={() => (showKey = !showKey)}>{showKey ? 'Hide' : 'Show'} key</button
			>
		</div>

		{#if showKey}
			<div class="mt-5">Key: {key}</div>
		{:else}
			<div class="mt-5">
				<label for="view-user">View user</label>
				<input
					name="view-user"
					class="ml-4 border border-gray-800 border-solid rounded px-1"
					placeholder="username"
					bind:value={viewUsername}
				/>
			</div>
			<div class="text-sm text-red-800">{viewUsernameError}</div>
		{/if}
	</div>
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
			class="mt-14 rounded border-gray-800 border-solid border py-4 hover:bg-gray-200 active:bg-gray-300 disabled:hover:bg-white disabled:border-gray-500 disabled:text-gray-500"
			on:click={addEquation}
			disabled={!!viewUsername}
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
					<button
						class="text-base rounded border-gray-800 border-solid border py-1 px-3 mb-4 hover:bg-gray-200 active:bg-gray-300 mx-2"
						on:click={() => (currentEq ? cloneEquation(currentEq) : undefined)}
					>
						Clone
					</button>
					{#if confirmDelete}
						<button
							class="text-base rounded border-solid border py-1 px-3 mb-4 mx-2 hover:bg-gray-200 active:bg-gray-300"
							on:click={() => {
								confirmDelete = false;
								if (currentEq) removeEquation(currentEq);
								currentEq = undefined;
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
							disabled={!!viewUsername}
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
				disabled={!!viewUsername}
				bind:value={currentEq.name}
				on:input={currentEq.h.onChange}
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
						disabled={!!viewUsername}
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
						disabled={!!viewUsername}
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
						disabled={!!viewUsername}
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

<div class="mt-16">
	<canvas id="simulation" bind:this={simulationCanvas} class="w-full" height="0" />
</div>

<div class="p-4 mt-16 prose">
	<h1>Usage</h1>
	<p>Add sets of equations using the "Add Equation" button.</p>
	<p>
		Each set of equations contains an "h" equation, an "s" equation, and a "v" equation. Each
		equation corresponds to each part of the <a href="https://en.wikipedia.org/wiki/HSL_and_HSV"
			>HSV color</a
		> of the LED.
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

<div class="p-4 mt-16">
	LEDs Password
	<div class="m-3">
		<label for="p1">Part 1</label>
		{#if showLEDPass}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p1"
				type="text"
				bind:value={password_p1}
			/>
		{:else}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p1"
				type="password"
				bind:value={password_p1}
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
				bind:value={password_p2}
			/>
		{:else}
			<input
				class="ml-4 border border-gray-800 border-solid rounded px-1"
				name="p2"
				type="password"
				bind:value={password_p2}
			/>
		{/if}
	</div>
	<div>
		<button
			class="text-1xl mt-20 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
			on:click={() => (showLEDPass = !showLEDPass)}>{showLEDPass ? 'Hide' : 'Show'}</button
		>
	</div>
</div>

<div class="p-4 flex flex-col mt-10">
	<div>
		{#if refreshKeyConfirm}
			<div class="flex">
				<button
					class="rounded border-gray-800 border-solid border w-36 py-2 mr-4 hover:bg-gray-200 active:bg-gray-300"
					on:click={() => {
						refreshKeyConfirm = false;
					}}
				>
					Cancel
				</button>
				<button
					class="rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
					on:click={() => refreshKey()}
				>
					Confirm
				</button>
			</div>
			<div>Note: Refreshing your key logs you out of all devices</div>
		{:else}
			<button
				class="rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
				on:click={() => (refreshKeyConfirm = true)}
			>
				Refresh Key
			</button>
		{/if}
	</div>
</div>

<div class="p-4 flex flex-col mt-10">
	<div class="flex">
		<label for="key">Key</label>
		<input
			class="ml-4 border border-gray-800 border-solid rounded px-1"
			name="key"
			bind:value={newKey}
		/>
	</div>
	<div class="text-sm text-red-800">{keyError}</div>
	<button
		class="rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => setKey()}
	>
		Set Key
	</button>
	<div>
		Note: Setting the key allows you to change accounts (remember to save your old key somewhere!)
	</div>
</div>

<div class="p-4 flex flex-col mt-10">
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

<div class="p-4 flex flex-col mt-10">
	<button
		class="rounded border-gray-800 border-solid border w-36 py-2 my-3 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => newAccount()}
	>
		New Account
	</button>
	<div>Note: Backup your current key first!</div>
</div>

<div class="p-4 flex flex-col">
	<button
		class="text-1xl mt-20 rounded border-gray-800 border-solid border w-36 py-2 hover:bg-gray-200 active:bg-gray-300"
		on:click={() => location.reload()}
	>
		Reload Page
	</button>
</div>
