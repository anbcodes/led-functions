import { browser } from "$app/environment";
import { cmds } from "./compilier";

const STACK_SIZE = 100;

let time = 0;
const sin_lookup = [
  128, 131, 134, 137, 140, 143, 146, 149, 152, 156, 159, 162, 165, 168, 171,
  174, 176, 179, 182, 185, 188, 191, 193, 196, 199, 201, 204, 206, 209, 211,
  213, 216, 218, 220, 222, 224, 226, 228, 230, 232, 234, 235, 237, 239, 240,
  242, 243, 244, 246, 247, 248, 249, 250, 251, 251, 252, 253, 253, 254, 254,
  254, 255, 255, 255, 255, 255, 255, 255, 254, 254, 253, 253, 252, 252, 251,
  250, 249, 248, 247, 246, 245, 244, 242, 241, 239, 238, 236, 235, 233, 231,
  229, 227, 225, 223, 221, 219, 217, 215, 212, 210, 207, 205, 202, 200, 197,
  195, 192, 189, 186, 184, 181, 178, 175, 172, 169, 166, 163, 160, 157, 154,
  151, 148, 145, 142, 138, 135, 132, 129, 126, 123, 120, 117, 113, 110, 107,
  104, 101, 98,  95,  92,  89,  86,  83,  80,  77,  74,  71,  69,  66,  63,
  60,  58,  55,  53,  50,  48,  45,  43,  40,  38,  36,  34,  32,  30,  28,
  26,  24,  22,  20,  19,  17,  16,  14,  13,  11,  10,  9,   8,   7,   6,
  5,   4,   3,   3,   2,   2,   1,   1,   0,   0,   0,   0,   0,   0,   0,
  1,   1,   1,   2,   2,   3,   4,   4,   5,   6,   7,   8,   9,   11,  12,
  13,  15,  16,  18,  20,  21,  23,  25,  27,  29,  31,  33,  35,  37,  39,
  42,  44,  46,  49,  51,  54,  56,  59,  62,  64,  67,  70,  73,  76,  79,
  81,  84,  87,  90,  93,  96,  99,  103, 106, 109, 112, 115, 118, 121, 124];

const runProgram = (prog: number[], ledIndex: number): number => {
  if (prog.find(v => Math.floor(v) !== v)) {
    throw new Error("Program contains non int");
  }

  const stack: number[] = [];
  let ptr = -1;
  for (let i = 0; i < prog.length; i++) {
    switch (prog[i]) {
      case cmds.SIN:
        stack[ptr] = sin_lookup[stack[ptr] % 256];
        break;
      case cmds.ADD:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] + stack[ptr + 1];
        break;
      case cmds.SUB:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] - stack[ptr + 1];
        break;
      case cmds.MUL:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] * stack[ptr + 1];
        break;
      case cmds.DIV:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = Math.floor(stack[ptr] / stack[ptr + 1]);
        break;
      case cmds.POW:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = Math.pow(stack[ptr], stack[ptr + 1]);
        break;
      case cmds.MOD:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] % stack[ptr + 1];
        break;
      case cmds.IF:
        ptr -= 2;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] ? stack[ptr + 1] : stack[ptr + 2];
        break;
      case cmds.EQ:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = +(stack[ptr] == stack[ptr + 1]);
        break;
      case cmds.GT:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = +(stack[ptr] > stack[ptr + 1]);
        break;
      case cmds.LT:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = +(stack[ptr] < stack[ptr + 1]);
        break;
      case cmds.AND:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] & stack[ptr + 1];
        break;
      case cmds.OR:
        ptr--;
        if (ptr < 0) return 1;
        stack[ptr] = stack[ptr] | stack[ptr + 1];
        break;
      case cmds.VAL:
        ptr++;
        if (ptr >= STACK_SIZE) return 1;
        stack[ptr] = prog[i + 1];
        i++;
        break;
      case cmds.VAR_T:
        ptr++;
        if (ptr >= STACK_SIZE) return 1;
        stack[ptr] = time;
        break;
      case cmds.VAR_I:
        ptr++;
        if (ptr >= STACK_SIZE) return 1;
        stack[ptr] = ledIndex;
        break;
      case cmds.END:
        return stack[0];
      default:
        break;
    }

    while (stack[ptr] < 0) {
      stack[ptr] += (2 ** 32);
    }

    while (stack[ptr] >= (2 ** 32)) {
      stack[ptr] -= (2 ** 32)
    }
  }
  return stack[0];
};

const ledCount = 238;

export const simulate = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, h: number[], s: number[], v: number[]): number => {
  time++;

  const leds = [...new Array(ledCount)].map(_ => ({h: 0, s: 0, v: 0}));
  for (let i = 0; i < leds.length; i++) {
    leds[i].h = runProgram(h, i) % 256;
    leds[i].s = runProgram(s, i) % 256;
    leds[i].v = runProgram(v, i) % 256;
  }

  leds.reverse();

  const ledWidth = canvas.width / leds.length;
  canvas.height = ledWidth;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < leds.length; i++) {
    ctx.fillStyle = `hsl(${leds[i].h / 256 * 360}, ${leds[i].s / 256 * 100}%, ${leds[i].v / 256 * 100}%)`
    ctx.fillRect(i * ledWidth, 0, ledWidth, ledWidth);
    // console.log("Filling", `hsl(${leds[i].h / 255 * 360}, ${leds[i].s / 255 * 100}%, ${leds[i].v / 255 * 100}%)`);
    // console.log("Filling", leds[i]);
  }

  return ledWidth;
};
