const cmds = {
  INVALID: 0,
  SIN: 1,
  ADD: 2,
  SUB: 3,
  MUL: 4,
  DIV: 5,
  POW: 6,
  MOD: 7,
  IF: 8,
  EQ: 9,
  GT: 10,
  LT: 11,
  AND: 12,
  OR: 13,
  VAL: 14,
  VAR_T: 15,
  VAR_I: 16,
  END: 17,
};

const cmdsAny: { [name: string]: number | undefined } = cmds;

// // deno-fmt-ignore
// const program_h = [
//   Cmds.MOD,
//     Cmds.DIV,
//       Cmds.DIV,
//         Cmds.ADD,
//           Cmds.MUL,
//             Cmds.VAR_T,
//             Cmds.VAL, 10,
//           Cmds.VAR_I,
//         Cmds.VAL, 500,
//       Cmds.DIV,
//         Cmds.VAL, 1,
//         Cmds.VAL, 500,
//   Cmds.VAL, 255
// ];

// i + t

// deno-fmt-ignore
const program_h = [
  cmds.VAR_I,
  cmds.VAR_T,
  cmds.ADD,
];

const program_s = [
  cmds.VAL,
  255,
];

// MUL(RND(DIV(ADD(SIN(ADD(VAR_T, VAR_I)), 1), 2)), 90)

// deno-fmt-ignore
const program_v = [
  cmds.VAL, 90,
];

const toTokens = (prog: string) => {
  return prog.split("").map((v, i) => {
    if (v === "(") return { type: "OPEN_PARAN", rawValue: v, index: i };
    else if (v === ")") return { type: "CLOSE_PARAN", rawValue: v, index: i };
    else if (v === " ") return { type: "WHITESPACE", rawValue: v, index: i };
    else if (v === "+") {
      return { type: "OPERATOR", operator: "ADD", rawValue: v, index: i };
    } else if (v === "-") {
      return { type: "OPERATOR", operator: "SUB", rawValue: v, index: i };
    } else if (v === "*") {
      return { type: "OPERATOR", operator: "MUL", rawValue: v, index: i };
    } else if (v === "/") {
      return { type: "OPERATOR", operator: "DIV", rawValue: v, index: i };
    } else if (v === "%") {
      return { type: "OPERATOR", operator: "MOD", rawValue: v, index: i };
    } else if (v === "^") {
      return { type: "OPERATOR", operator: "POW", rawValue: v, index: i };
    } else if (v === ">") {
      return { type: "OPERATOR", operator: "GT", rawValue: v, index: i };
    } else if (v === "<") {
      return { type: "OPERATOR", operator: "LT", rawValue: v, index: i };
    } else if (v === "=") {
      return { type: "OPERATOR", operator: "EQ", rawValue: v, index: i };
    } else if (v === ",") {
      return { type: "OPERATOR", operator: "SEP", rawValue: v, index: i };
    } else if (v === "&") {
      return { type: "OPERATOR", operator: "AND", rawValue: v, index: i };
    } else if (v === "|") {
      return { type: "OPERATOR", operator: "OR", rawValue: v, index: i };
    } else return { type: "LITERAL", value: v, rawValue: v, index: i };
  });
};

interface ValNode {
  type: "value";
  val: number;
  index: number;
}

interface VarNode {
  type: "variable";
  name: string;
  index: number;
}

interface OpNode {
  type: "operator";
  a: Node;
  b: Node;
  op: string;
  index: number;
}

interface CallNode {
  type: "call";
  name: string;
  args: Node[];
  index: number;
}

type Node = OpNode | ValNode | VarNode | CallNode;

const orderOfOperations = [
  ["SEP"],
  ["AND", "OR"],
  ["GT", "LT", "EQ"],
  ["MOD"],
  ["ADD", "SUB"],
  ["DIV", "MUL"],
];

class ExpressionSyntaxError extends Error {
  constructor(message: string, public index: number) {
    super(message);
  }
}

const toAST = (tokens: ReturnType<typeof toTokens>): Node => {
  for (let j = 0; j < orderOfOperations.length; j++) {
    const currentOperators = orderOfOperations[j];
    let nest = 0;
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.type === "OPEN_PARAN") nest += 1;
      if (token.type === "CLOSE_PARAN") nest -= 1;
      if (
        token.type === "OPERATOR" && nest == 0 &&
        currentOperators.includes(token.operator as string)
      ) {
        return {
          type: "operator",
          op: token.operator as string,
          a: toAST(tokens.slice(0, i)),
          b: toAST(tokens.slice(i + 1)),
          index: token.index,
        };
      }
    }
  }

  let literal = "";
  let literalIndex = -1;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "LITERAL") {
      literal += token.value as string;
      if (literalIndex === -1) {
        literalIndex = token.index;
      }
    }
    if (token.type === "OPEN_PARAN") {
      if (tokens.slice(-1)[0].type !== "CLOSE_PARAN") {
        throw new ExpressionSyntaxError(
          "Unmatched opening parenthesis",
          token.index,
        );
      }
      if (literal) {
        const res = toAST(tokens.slice(i + 1, -1));
        const args: Node[] = [];

        const find = (node: Node) => {
          if (node.type === "operator" && node.op === "SEP") {
            find(node.a);
            find(node.b);
          } else {
            args.push(node);
          }
        };

        find(res);

        return {
          type: "call",
          name: literal,
          args,
          index: literalIndex,
        };
      } else {
        return toAST(tokens.slice(i + 1, -1));
      }
    }
  }

  const nonLit = tokens.find((v) => v.type !== "LITERAL");
  if (nonLit) {
    throw new ExpressionSyntaxError(
      `Unexpected token: ${nonLit.rawValue}`,
      nonLit.index,
    );
  }

  literal = tokens.map((v) => v.value).join("");

  if (!isNaN(parseInt(literal, 10))) {
    return {
      type: "value",
      val: parseInt(literal, 10),
      index: tokens[0].index,
    };
  } else {
    return {
      type: "variable",
      name: literal,
      index: tokens[0].index,
    };
  }
};

const compileAST = (node: Node): number[] => {
  if (node.type === "call") {
    if (node.name === "if") {
      return [
        ...compileAST(node.args[0]),
        ...compileAST(node.args[1]),
        ...compileAST(node.args[2]),
        cmds.IF,
      ];
    } else if (node.name === "sin") {
      return [
        ...compileAST(node.args[0]),
        cmds.SIN,
      ];
    } else {
      throw new ExpressionSyntaxError(
        `Invalid function: ${node.name}`,
        node.index,
      );
    }
  } else if (node.type === "operator") {
    const cmd = cmdsAny[node.op];
    if (cmd === undefined) {
      throw new ExpressionSyntaxError(
        `Invalid operator: ${node.op}`,
        node.index,
      );
    }
    return [
      ...compileAST(node.a),
      ...compileAST(node.b),
      cmd,
    ];
  } else if (node.type === "value") {
    return [
      cmds.VAL,
      node.val,
    ];
  } else if (node.type === "variable") {
    if (node.name === "i") return [cmds.VAR_I];
    else if (node.name === "t") return [cmds.VAR_T];
    else {
      throw new ExpressionSyntaxError(
        `Unknown variable: ${node.name}`,
        node.index,
      );
    }
  } else {
    // This never happens
    throw new Error("INVALID TYPE");
  }
};

const disasm = (prog: number[]) => {
  const res = [];
  for (let i = 0; i < prog.length; i++) {
    if (prog[i - 1] === cmds.VAL) {
      res.push(prog[i].toString());
    } else {
      res.push(Object.entries(cmds).find((v) => v[1] === prog[i])?.[0]);
    }
  }
  return res;
};

const parse = (prog: string) => {
  try {
    const tokens = toTokens(prog);
    const ast = toAST(tokens.filter((v) => v.type !== "WHITESPACE"));
    const compiled = compileAST(ast);

    return compiled;
  } catch (e) {
    if (e instanceof ExpressionSyntaxError) {
      console.error(`\x1B[1;31mError:\x1B[0m ${e.message}`);
      console.error("   " + prog);
      console.error("   " + " ".repeat(e.index) + "^");
    } else {
      throw e;
    }
  }
};

const send = async (
  program_h: number[],
  program_s: number[],
  program_v: number[],
  ishsv: boolean,
) => {
  const prog_h = new Uint32Array(program_h);
  const prog_s = new Uint32Array(program_s);
  const prog_v = new Uint32Array(program_v);
  const ishsv_arr = new Uint32Array([+ishsv]);
  const sep_arr = new Uint32Array([cmds.END, 0]);

  const socket = await Deno.connect({ hostname: "192.168.86.49", port: 11234 });
  console.log("Connected");
  await socket.write(new Uint8Array(ishsv_arr.buffer));
  await socket.write(new Uint8Array(prog_h.buffer));
  await socket.write(new Uint8Array(sep_arr.buffer));
  await socket.write(new Uint8Array(prog_s.buffer));
  await socket.write(new Uint8Array(sep_arr.buffer));
  await socket.write(new Uint8Array(prog_v.buffer));
  await socket.write(new Uint8Array(sep_arr.buffer));
  socket.close();
  console.log("Done");
};

const h = parse("i + t * 2");
const s = parse("255");
const v = parse("if(t + i % 256 > 200, 0, 90)");
// const v = parse("90");

if (h && s && v) {
  console.log(disasm(v));
  send(h, s, v, true);
}
