export type Instruction = {
  type: "A";
  num: number;
}
| {
  type: "C";
  jump : number;
  dest : number;
  comp : number;
  a : boolean;
};

export function parseInstruction(inst : number) : Instruction {
  // There are two instruction types in Hack:
  // A-instructions and C-instructions. They are differentiated
  // by the highest bit.
  const instType = inst & 0b1000000000000000;
  if(instType === 0) {
    // A-instruction sets the register A to a 15-bit value.
    // It has the following format:
    //
    // 0aaa aaaa aaaa aaaa
    //
    return {
      type: "A",
      num: inst
    };
  }
  else {
    // C-instruction is the compute instruction.
    // It has the following format:
    //
    // 100a cccc ccdd djjj
    //
    // a - determines whether to source the value for one
    //     of the operands from register A (0) or from memory 
    //     at the address in register A (1)
    // 
    // c - 6-bits that are passed directly into the ALU. Look at 
    //     alu() function for more info.
    //
    // d - destination bits that determine where to write the result
    //     of the computation. From highest to lowest bit: 
    //     register A, register D, memory at address A.
    //
    // j - jump bits. Jumps to the instruction at address A, depending
    //     on a condition, from highest to lowest:
    //     out < 0, out = 0, out > 0.

    //                   100accccccdddjjj
    const jump = (inst & 0b0000000000000111);
    const dest = (inst & 0b0000000000111000) >> 3;
    const comp = (inst & 0b0000111111000000) >> 6;
    const a    = (inst & 0b0001000000000000);
    return {
      type: "C",
      jump : jump,
      dest : dest,
      comp : comp,
      a : a !== 0,
    };
  }
}

// =============================================================================
// Pretty printing

export function ppComp(comp : number, a: boolean): string {
  const A = a ? "M" : "A";
  switch(comp) {
    case 0b101010: return `0`;
    case 0b111111: return `1`;
    case 0b111010: return `-1`;
    case 0b001100: return `D`;
    case 0b110000: return `${A}`;
    case 0b001101: return `!D`;
    case 0b110001: return `!${A}`;
    case 0b001111: return `-D`;
    case 0b110011: return `-${A}`;
    case 0b011111: return `D+1`;
    case 0b110111: return `${A}+1`;
    case 0b001110: return `D-1`;
    case 0b110010: return `${A}-1`;
    case 0b000010: return `D+${A}`;
    case 0b010011: return `D-${A}`;
    case 0b000111: return `${A}-D`;
    case 0b000000: return `D&${A}`;
    case 0b010101: return `D|${A}`;
    default: return "UNK";
  }
}

export function ppDest(dest : number): string {
  let out = "";
  if((dest & 0b001) !== 0) { out += "M" }
  if((dest & 0b010) !== 0) { out += "D" }
  if((dest & 0b100) !== 0) { out += "A" }
  return out;
}

export function ppJump(jump : number): string {
  switch(jump) {
    case 0b000: return ``;
    case 0b001: return `JGT`;
    case 0b010: return `JEQ`;
    case 0b011: return `JGE`;
    case 0b100: return `JLT`;
    case 0b101: return `JNE`;
    case 0b110: return `JLE`;
    case 0b111: return `JMP`;
    default: throw new Error("Invariant failed: Jump was >= 8");
  }
}

export function ppInstruction(inst : Instruction): string {
  switch(inst.type) {
    case "A": {
      return `@${inst.num}`;
    }
    case "C": {
      let out = ""
      const dest = ppDest(inst.dest);
      if(dest !== "") { out += dest + "=" }
      out += ppComp(inst.comp, inst.a);
      const jump = ppJump(inst.jump);
      if(jump !== "") { out += ";" + jump; }
      return out;
    }
  }
}