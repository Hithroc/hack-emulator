// Crude assembly for Hack

const instRegexp = /^(?<instruction>(?<c>((?<dest>[ADM][ADM]?[ADM]?)=)?(?<comp>[ADM]?[+\-&|!]?[ADM10])(;(?<jump>JGT|JEQ|JGE|JLT|JNE|JLE|JMP))?)|(@(?<aconst>\d+))?|(@(?<alabel>[\w_].*))|(\((?<label>[\w_].*)\)))?(\/\/.*)?$/;

type AsmLine = { type: "instruction" | "label" | "alabel", result: string } | "skip" | "error";

function processLine(str : string): AsmLine {
  const m = str.replace(/\s/g,'').match(instRegexp);
  if(m === null || m.groups === undefined) {
    return "error";
  }
  if(m.groups.instruction === undefined) {
    return "skip"
  }
  if(m.groups.label !== undefined) {
    return { type : "label", result : m.groups.label };
  }
  if(m.groups.aconst !== undefined) {
    let num = parseInt(m.groups.aconst);
    num = num & 0x7FFF; // clamp to 15 bit
    return { type: "instruction", result: num.toString(2).padStart(16, "0") };
  }
  if(m.groups.alabel !== undefined) {
    return { type: "alabel", result: m.groups.alabel };
  }
  if(m.groups.c !== undefined) {
    let jump = "";
    let comp = "";
    let dest = "";
    if(m.groups.dest !== undefined) {
      dest += m.groups.dest.includes("A") ? "1" : "0";
      dest += m.groups.dest.includes("D") ? "1" : "0";
      dest += m.groups.dest.includes("M") ? "1" : "0";
    }
    else {
      dest = "000";
    }
    switch(m.groups.jump) {
      case "JGT": jump = "001"; break;
      case "JEQ": jump = "010"; break;
      case "JGE": jump = "011"; break;
      case "JLT": jump = "100"; break;
      case "JNE": jump = "101"; break;
      case "JLE": jump = "110"; break;
      case "JMP": jump = "111"; break;
      default: jump = "000"; break;
    }
    switch(m.groups.comp) {
      case   "0": comp = "0101010"; break;
      case   "1": comp = "0111111"; break;
      case  "-1": comp = "0111010"; break;
      case   "D": comp = "0001100"; break;
      case   "A": comp = "0110000"; break;
      case   "M": comp = "1110000"; break;
      case  "!D": comp = "0001101"; break;
      case  "!A": comp = "0110001"; break;
      case  "!M": comp = "1110001"; break;
      case  "-D": comp = "1001111"; break;
      case  "-A": comp = "1110011"; break;
      case  "-M": comp = "1110011"; break;
      case "D+1": comp = "0011111"; break;
      case "A+1": comp = "0110111"; break;
      case "M+1": comp = "1110111"; break;
      case "D-1": comp = "0001110"; break;
      case "A-1": comp = "0110010"; break;
      case "M-1": comp = "1110010"; break;
      case "D+A": comp = "0000010"; break;
      case "D+M": comp = "1000010"; break;
      case "D-A": comp = "0010011"; break;
      case "D-M": comp = "1010011"; break;
      case "A-D": comp = "0000111"; break;
      case "M-D": comp = "1000111"; break;
      case "D&A": comp = "0000000"; break;
      case "D&M": comp = "1000000"; break;
      case "D|A": comp = "0010101"; break;
      case "D|M": comp = "1010101"; break;
      default: return "error";
    }
    return { type: "instruction", result: "111" + comp + dest + jump };
  }
  return "error";
}

type FirstPass = { type: "label" | "instruction", payload: string }
export function asm(str: string): string {
  const lines = str.split('\n');
  const processed : FirstPass[] = [];
  const symbolTable : {[key: string] : number} = {
    "SCREEN": 16384,
    "KBD": 24576,
    "R0": 0, "R1": 1, "R2": 2, "R3": 3,
    "R4": 4, "R5": 5, "R6": 6, "R7": 7,
    "R8": 8, "R9": 9, "R10": 10, "R11": 11,
    "R12": 12, "R13": 13, "R14": 14, "R15": 15,
    "SP": 0, "LCL": 1, "ARG": 2, "THIS": 3, "THAT": 4
  };

  let pc = 0
  for(let i = 0; i < lines.length; i++) {
    const res = processLine(lines[i])
    if(res === "skip") { continue; }
    if(res === "error") { throw new Error(`Error processing line ${i}, instruction: ${lines[i]}`)}
    if(res.type === "label") { symbolTable[res.result] = pc; continue; }
    if(res.type === "instruction") { processed.push({ type: "instruction", payload: res.result }); pc += 1; }
    if(res.type === "alabel") { processed.push({ type: "label", payload: res.result }); pc += 1; }
  }
  let out = "";
  let varCount = 0b10000;
  for(let i = 0; i < processed.length; i++) {
    if(processed[i].type === "instruction") { out += `${processed[i].payload}\n`; }
    else {
      let outNum = 0;
      if(processed[i].payload in symbolTable) {
        outNum = symbolTable[processed[i].payload];
      }
      else {
        outNum = varCount & 0x7FFF;
        symbolTable[processed[i].payload] = outNum;
        varCount += 1;
      }
      out += `${outNum.toString(2).padStart(16, "0")}\n`;
    }
  }
  return out;
}