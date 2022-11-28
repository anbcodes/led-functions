<script lang="ts">
	import { compile } from './compilier';
	import { simulate } from './simulator';
	import type { Pattern } from './types';

	export let patterns: Pattern[];
	export let currentPatternId: string;

	let pattern: Pattern;
	$: pattern = patterns.find((v) => v.id === currentPatternId) as Pattern;

	let canvas: HTMLCanvasElement;

	setInterval(() => {
		if (!pattern || !canvas) return;

		const { compiled: h } = compile(pattern.h);
		const { compiled: s } = compile(pattern.s);
		const { compiled: v } = compile(pattern.v);

		if (!h || !s || !v) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		simulate(canvas, ctx, h, s, v);
	}, 1000 / 50);
</script>

<canvas class="w-full" height="0" bind:this={canvas} />
