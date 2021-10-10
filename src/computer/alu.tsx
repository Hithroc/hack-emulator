export type ALUOut = {
  out : number; // Numeral output of the ALU
  ng : boolean; // Is out negative? 
  zr : boolean; // Is out zero?
};

export function alu(x : number, y : number, zx : boolean, nx : boolean, zy : boolean, ny : boolean, f : boolean, no : boolean) : ALUOut {
  // Clamp the input to 16 bits just in case
  x &= 0xFFFF;
  y &= 0xFFFF;

  let out = 0;

  if(zx) { x = 0; }
  if(nx) { x = ~x; }
  if(zy) { y = 0; }
  if(ny) { y = ~y; }
  if(f ) { out = x+y; }
  else   { out = x&y; }
  if(no) { out = ~out; }
  out &= 0xFFFF; // Clamp output in case it overflew

  return {
    out : out,
    ng : (out & 0x8000) === 0x8000, // If the highest bit is 1 then the number is negative
    zr : out === 0
  };
}

export function alu_helper(x : number, y : number, comp : number) : ALUOut {
  const zx = (comp & 0b100000) !== 0;
  const nx = (comp & 0b010000) !== 0;
  const zy = (comp & 0b001000) !== 0;
  const ny = (comp & 0b000100) !== 0;
  const f  = (comp & 0b000010) !== 0;
  const no = (comp & 0b000001) !== 0;
  return alu(x, y, zx, nx, zy, ny, f, no);
}
