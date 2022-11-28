<div class="prose">
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
