<script lang="ts">
	import { onMount } from 'svelte';
	import AccountInformation from './AccountInformation.svelte';
	import AddPatternBtn from './AddPatternBtn.svelte';
	import { cmds, compile } from './compilier';
	import EquationList from './EquationList.svelte';
	import LedAuth from './LedAuth.svelte';
	import NewAccountBtn from './NewAccountBtn.svelte';
	import PatternEditor from './PatternEditor.svelte';
	import RefreshKeyBtn from './RefreshKeyBtn.svelte';
	import ReloadBtn from './ReloadBtn.svelte';
	import SetKey from './SetKey.svelte';
	import SetUsername from './SetUsername.svelte';
	import Simulation from './Simulation.svelte';
	import type { Pattern } from './types';
	import Usage from './Usage.svelte';
	import ViewUser from './ViewUser.svelte';

	let key = '';
	let mounted = false;

	let patterns: Pattern[] = [];
	let currentPatternId = '';
	$: {
		const pattern = patterns.find((v) => v.id === currentPatternId);
		if (pattern) {
			sendPatternToArduino(pattern);
		}
	}

	let viewPatterns: Pattern[] = [];

	let onlyViewing = false;
	$: onlyViewing = viewPatterns.length !== 0;

	let LEDPassword: [string, string] = ['', ''];
	$: if (mounted) localStorage.setItem('ledPass', JSON.stringify(LEDPassword));

	const savePatterns = async () => {
		console.log('Saving patterns...');

		await fetch(`https://leds.spry.workers.dev/data?key=${key}`, {
			method: 'PUT',
			body: JSON.stringify({
				patterns
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	};

	const onNewPattern = ({ detail: pattern }: CustomEvent<Pattern>) => {
		patterns = [...patterns, pattern];
		currentPatternId = pattern.id;
		if (onlyViewing) {
			viewPatterns = [];
		}
		savePatterns();
	};

	const onRemovePattern = ({ detail: pattern }: CustomEvent<Pattern>) => {
		patterns = patterns.filter((v) => v.id !== pattern.id);
		savePatterns();
	};

	const onPatternEdit = ({ detail: pattern }: CustomEvent<Pattern>) => {
		const index = patterns.findIndex((v) => v.id === currentPatternId);
		patterns[index] = pattern;
		savePatterns();

		sendPatternToArduino(pattern);
	};

	let arduinoWaitingInterval: NodeJS.Timer;
	let socketOpen = false;
	const sendPatternToArduino = (pattern: Pattern, ishsv = true) => {
		if (!+LEDPassword[0] || !+LEDPassword[1]) return;

		if (socketOpen) {
			clearInterval(arduinoWaitingInterval);
			arduinoWaitingInterval = setInterval(() => {
				if (!socketOpen) {
					sendPatternToArduino(pattern, ishsv);
					clearInterval(arduinoWaitingInterval);
				}
			}, 100);
			return;
		}

		const { compiled: h_compiled } = compile(pattern.h);
		const { compiled: s_compiled } = compile(pattern.s);
		const { compiled: v_compiled } = compile(pattern.v);

		if (!h_compiled || !s_compiled || !v_compiled) return;

		const password_arr = new Uint32Array([+LEDPassword[0], +LEDPassword[1]]);
		const prog_h = new Uint32Array(h_compiled);
		const prog_s = new Uint32Array(s_compiled);
		const prog_v = new Uint32Array(v_compiled);
		const ishsv_arr = new Uint32Array([+ishsv]);
		const sep_arr = new Uint32Array([cmds.END, 0]);

		const socket = new WebSocket('wss://home.anb.codes:13655');
		socketOpen = true;
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
			socketOpen = false;
			console.log('closed');
		});
	};

	const onKeySet = ({ detail: newKey }: CustomEvent<string>) => {
		key = newKey;
		localStorage.setItem('key', newKey);
	};

	const onViewUser = ({ detail: patterns }: CustomEvent<Pattern[]>) => {
		viewPatterns = patterns;
	};

	const makeNewAccount = async () => {
		console.log('Making new account...');

		const res = await fetch('https://leds.spry.workers.dev/new-user', {
			method: 'POST'
		});

		const json = await res.json();

		if (json.key) {
			key = json.key;
			localStorage.setItem('key', key);
		}
	};

	onMount(async () => {
		key = localStorage.getItem('key') ?? '';
		LEDPassword = JSON.parse(localStorage.getItem('ledPass') ?? `["",""]`);
		if (!key) await makeNewAccount();

		const res = await fetch(`https://leds.spry.workers.dev/data?key=${key}`);
		const json = await res.json();

		if (json.data) {
			const data = JSON.parse(json.data);
			patterns = data?.patterns ?? [];
		}

		mounted = true;
	});
</script>

<header class="pb-10 p-5 text-5xl">LEDS</header>
<main class="p-5">
	<div class="flex">
		<div
			class="md:flex flex-col flex-shrink-0 text-2xl w-full md:w-[300px] md:border-r border-gray-800 border-solid pr-4"
			class:hidden={currentPatternId != ''}
			class:flex={currentPatternId == ''}
		>
			<EquationList patterns={onlyViewing ? viewPatterns : patterns} bind:currentPatternId />
			<AddPatternBtn disabled={onlyViewing} on:newPattern={onNewPattern} />
		</div>
		<div class="pl-5 flex-grow">
			{#if currentPatternId != ''}
				<PatternEditor
					patterns={onlyViewing ? viewPatterns : patterns}
					{currentPatternId}
					disabled={onlyViewing}
					on:edit={onPatternEdit}
					on:newPattern={onNewPattern}
					on:remove={onRemovePattern}
					on:close={() => (currentPatternId = '')}
				/>
			{/if}
		</div>
	</div>

	<div class="my-8">
		<Simulation patterns={onlyViewing ? viewPatterns : patterns} {currentPatternId} />
	</div>

	<div class="my-8">
		<RefreshKeyBtn {key} on:newKey={onKeySet} />
	</div>
	<div class="my-8">
		<SetKey on:newKey={onKeySet} />
	</div>
	<div class="my-8">
		<SetUsername {key} on:update={() => (key = key)} />
	</div>
	<div class="my-8">
		<NewAccountBtn on:click={makeNewAccount} />
	</div>
	<div class="my-8">
		<AccountInformation {key} />
	</div>
	<div class="my-8">
		<ViewUser on:view={onViewUser} />
	</div>
	<div class="my-8">
		<LedAuth bind:LEDPassword />
	</div>
	<div class="my-8">
		<Usage />
	</div>
	<div class="my-8">
		<ReloadBtn />
	</div>
</main>
