/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npx wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npx wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// These initial Types are based on bindings that don't exist in the project yet,
// you can follow the links to learn how to implement them.

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	KV: KVNamespace
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket
}

const generateKey = () => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ01234567890';
  
  const array = new Uint8Array(25);
  crypto.getRandomValues(array);

  return [...array].map((v) => alphabet[Math.round(v / 255 * alphabet.length)])
    .join("");
}

const adjectives = ["adorable","adventurous","aggressive","agreeable","alert","alive","amused","angry","annoyed","annoying","anxious","arrogant","ashamed","attractive","average","awful","bad","beautiful","better","bewildered","black","bloody","blue","blue-eyed","blushing","bored","brainy","brave","breakable","bright","busy","calm","careful","cautious","charming","cheerful","clean","clear","clever","cloudy","clumsy","colorful","combative","comfortable","concerned","condemned","confused","cooperative","courageous","crazy","creepy","crowded","cruel","curious","cute","dangerous","dark","dead","defeated","defiant","delightful","depressed","determined","different","difficult","disgusted","distinct","disturbed","dizzy","doubtful","drab","dull","eager","easy","elated","elegant","embarrassed","enchanting","encouraging","energetic","enthusiastic","envious","evil","excited","expensive","exuberant","fair","faithful","famous","fancy","fantastic","fierce","filthy","fine","foolish","fragile","frail","frantic","friendly","frightened","funny","gentle","gifted","glamorous","gleaming","glorious","good","gorgeous","graceful","grieving","grotesque","grumpy","handsome","happy","healthy","helpful","helpless","hilarious","homeless","homely","horrible","hungry","hurt","ill","important","impossible","inexpensive","innocent","inquisitive","itchy","jealous","jittery","jolly","joyous","kind","lazy","light","lively","lonely","long","lovely","lucky","magnificent","misty","modern","motionless","muddy","mushy","mysterious","nasty","naughty","nervous","nice","nutty","obedient","obnoxious","odd","old-fashioned","open","outrageous","outstanding","panicky","perfect","plain","pleasant","poised","poor","powerful","precious","prickly","proud","putrid","puzzled","quaint","real","relieved","repulsive","rich","scary","selfish","shiny","shy","silly","sleepy","smiling","smoggy","sore","sparkling","splendid","spotless","stormy","strange","stupid","successful","super","talented","tame","tasty","tender","tense","terrible","thankful","thoughtful","thoughtless","tired","tough","troubled","ugliest","ugly","uninterested","unsightly","unusual","upset","uptight","vast","victorious","vivacious","wandering","weary","wicked","wide-eyed","wild","witty","worried","worrisome","wrong","zany","zealous"];
const nouns = ["Alligator","Alpaca","Anaconda","Ant","Anteater","Antelope","Baboon","Badger","Bald","Eagle","Barracuda","Bass","Hound","Bat","Beaver","Bedbug","Bee", "Bird","Bison", "BlueJay","BlueWhale","Bobcat","Buffalo","Butterfly","Camel", "Carp","Cat","Caterpillar","Catfish","Cheetah","Chicken","Chimpanzee","Chipmunk","Cobra","Cod","Condor","Cougar","Cow","Coyote","Crab","Crane","Fly","Cricket","Crocodile","Crow","Deer","Dinosaur","Dog","Dolphin","Donkey","Dove","Dragonfly","Duck","Eagle","Eel","Elephant","Emu","Falcon","Ferret","Finch","Fish","Flamingo","Flea","Fly","Fox","Frog","Goat","Goose","Gopher","Gorilla","Guinea","Pig","Hamster","Hare","Hawk","Hippo","Horse","Hummingbird","Humpback","Whale","Husky","Iguana","Impala","Kangaroo","Lemur","Leopard","Lion","Lizard","Llama","Lobster","Margay","Monitor","Lizard","Monkey","Moose","Mosquito","Moth","Mountain","Zebra","Mouse","Mule","Octopus","Orca","Ostrich","Otter","Owl","Ox","Oyster","Panda","Parrot","Peacock","Pelican","Penguin","Perch" ,"Pig","Pigeon","Polar","Bear","Porcupine","Quagga","Rabbit","Raccoon","Rat","Rattlesnake","Red","Wolf","Rooster","Seal","Sheep","Skunk","Sloth","Snail","Snake","Spider","Tiger","Whale","Wolf","Wombat","Zebra" ]
const generateUsername = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${number}`;
}

const sha256 = async (str: string) => {
  const myText = new TextEncoder().encode(str);

  const myDigest = await crypto.subtle.digest(
    {
      name: 'SHA-256',
    },
    myText // The data you want to hash as an ArrayBuffer
  );

  return base64ArrayBuffer(myDigest);
}

const json = (obj: any, init: ResponseInit = {}) => {
  return new Response(JSON.stringify(obj), {
    status: 200,
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      ...(init.headers || {}),
    },
  })
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		const { pathname, searchParams } = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response('', {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "*",
          "Access-Control-Allow-Headers": "*",
        },
        status: 200,
      })
    }

    if (pathname.startsWith("/new-user") && request.method === 'POST') {

      let username = generateUsername();
      while (await env.KV.get(`user-${username}`)) {
        username = generateUsername();
      }

      const key = generateKey();

      await env.KV.put(`key-${await sha256(key)}`, username);

      return json({ key, username })
    } else if (pathname.startsWith("/data")) {
      if (request.method === 'GET') {
        const user = searchParams.get('username');
        const data = await env.KV.get(`user-${user ?? ''}`)
        if (!data) return json({ error: "User not found" }, {status: 404});
        
        return json({ data });
      } else if (request.method === 'PUT') {
        const key = searchParams.get('key');
        
        if (!key) return json({ error: "Invalid key" }, {status: 400});
        
        const user = await env.KV.get(`key-${await sha256(key)}`);
        
        if (!user) return json({ error: "Invalid key" }, {status: 400});
        
        const data = await request.text();

        await env.KV.put(`user-${user}`, data);

        return json({ success: true });
      }
    } else if (pathname.startsWith("/new-pass") && request.method === 'POST') {
      const oldKey = searchParams.get('key')
      if (!oldKey) return json({ error: "Invalid key" }, {status: 400});
      
      const shaOldKey = await sha256(oldKey);

      const user = await env.KV.get(`key-${shaOldKey}`);
        
      if (!user) return json({ error: "Invalid key" }, {status: 400});

      await env.KV.delete(`key-${shaOldKey}`);

      const newKey = generateKey();

      await env.KV.put(`key-${await sha256(newKey)}`, user);

      return json({ key: newKey });

    } else if (pathname.startsWith("/set-username") && request.method === 'POST') {
      const key = searchParams.get('key');
      if (!key) return json({ error: "Invalid key" }, {status: 400});

      const newUsername = searchParams.get("username");
      if (!newUsername || newUsername.length == 0) return json({ error: "Invalid username" }, {status: 400})

      const user = await env.KV.get(`key-${await sha256(key)}`);
        
      if (!user) return json({ error: "Invalid key" }, {status: 400});

      if (await env.KV.get(`user-${newUsername}`)) {
        return json({error: 'Username taken'}, {status: 400});
      }

      await env.KV.put(`key-${await sha256(key)}`, newUsername);

      const contents = await env.KV.get(`user-${user}`);

      if (contents) {
        await env.KV.delete(`user-${user}`);

        await env.KV.put(`user-${newUsername}`, contents);
      }

      return json({ success: true });
    } else if (pathname.startsWith('/get-username') && request.method === 'GET') {
      const key = searchParams.get('key');
      if (!key) return json({ error: "Invalid key" }, {status: 400});

      const username = await env.KV.get(`key-${await sha256(key)}`);

      if (!username) return json({ error: "Invalid key" }, {status: 400});

      return json({ username });
    }

    return json({error: "Not found" }, {status: 404});
	},
}
// https://gist.github.com/jonleighton/958841
function base64ArrayBuffer(arrayBuffer: ArrayBuffer) {
  var base64    = ''
  var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

  var bytes         = new Uint8Array(arrayBuffer)
  var byteLength    = bytes.byteLength
  var byteRemainder = byteLength % 3
  var mainLength    = byteLength - byteRemainder

  var a, b, c, d
  var chunk

  // Main loop deals with bytes in chunks of 3
  for (var i = 0; i < mainLength; i = i + 3) {
    // Combine the three bytes into a single integer
    chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

    // Use bitmasks to extract 6-bit segments from the triplet
    a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
    b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
    c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
    d = chunk & 63               // 63       = 2^6 - 1

    // Convert the raw binary segments to the appropriate ASCII encoding
    base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
  }

  // Deal with the remaining bytes and padding
  if (byteRemainder == 1) {
    chunk = bytes[mainLength]

    a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

    // Set the 4 least significant bits to zero
    b = (chunk & 3)   << 4 // 3   = 2^2 - 1

    base64 += encodings[a] + encodings[b] + '=='
  } else if (byteRemainder == 2) {
    chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

    a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
    b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4

    // Set the 2 least significant bits to zero
    c = (chunk & 15)    <<  2 // 15    = 2^4 - 1

    base64 += encodings[a] + encodings[b] + encodings[c] + '='
  }
  
  return base64
}
