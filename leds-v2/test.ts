const socket = await Deno.connect({ hostname: "192.168.86.49", port: 11234 });

socket.write(new Uint8Array([0, 0, 0, 0]));

while (true) {
}
