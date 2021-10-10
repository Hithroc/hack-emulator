import { alu_helper } from "./alu";
import { parseInstruction } from './instruction';

export class Computer {
  ram : Uint16Array = new Uint16Array(32768);
  rom : Uint16Array = new Uint16Array(32768);
  regA  = 0;
  regD  = 0;
  pc  = 0; // Program Counter

  screenSlice() : Uint16Array {
    return this.ram.subarray(16384, 24576);
  }

  keyboardSlice() : Uint16Array {
    return this.ram.subarray(24576, 24577);
  }

  executeInstruction(): void {
    const inst = parseInstruction(this.rom[this.pc]);
    switch(inst.type) {
      case "A": {
        this.regA = inst.num;
        this.pc += 1;
        break;
      }
      case "C": {
        const x = this.regD;
        const y = inst.a ? this.ram[this.regA] : this.regA;

        const {out: out, ng: ng, zr: zr } = alu_helper(x, y, inst.comp);

        const should_jump = (((inst.jump & 0b001) !== 0) && !ng && !zr) 
                       || (((inst.jump & 0b010) !== 0) && zr) 
                       || (((inst.jump & 0b100) !== 0) && ng);
        if(should_jump) {
          this.pc = this.regA;
        }
        else {
          this.pc += 1;
        }

        if((inst.dest & 0b001) !== 0) {
          this.ram[this.regA] = out;
        }
        if((inst.dest & 0b010) !== 0) {
          this.regD = out;
        }
        if((inst.dest & 0b100) !== 0) {
          this.regA = out;
        }
        break;
      }
    }
    this.pc %= 32768;
  }
}

export class ComputerRunner {
  running  = false;
  counter  = 0;
  measuredSpeed  = 0;
  clock  = 1;
  timeInterval  = 1000;
  computer = new Computer();
  refreshCount  = 0;

  loop(refresh : () => void): void {
    const cycle = () => {
      setTimeout(() => cycle(), this.timeInterval);
      this.executeBatch();
      this.refreshCount += 1;
      if(this.refreshCount > 10 || this.timeInterval > 4) {
        this.refreshCount = 0;
        refresh();
      }
    };
    const measure = () => {
      this.measuredSpeed = this.counter / 2;
      this.counter = 0;
      console.log(this.timeInterval, this.clock, this.measuredSpeed);
      setTimeout(() => measure(), 2000);
    }
    cycle();
    measure();
  }

  run(): void {
    this.running = true;
  }

  pause(): void {
    this.running = false;
  }

  reset(): void {
    this.computer.pc = 0;
  }

  step(): void {
    this.computer.executeInstruction();
  }

  setClock(clock : number): void {
    // In modern browsers the minimum interval you can set with setTimeout or
    // setInterval is 4ms.
    // That is fairly annoying if we want to have clocks higher than 250Hz. To
    // combat this we batch instructions and execute them at 250Hz.
    // For example if we want 1kHz clock, we're going to execute 4 instructions
    // every 4ms (or 4 instructions at 250Hz).
    // If desired clock rate is less than 250Hz, then we set batch size to 1 and 
    // and just set the interval to the desired value.
    const smallestInterval = 4;
    // Maximum clock before we hit 4ms
    const maxIntervalClock = 1000 / smallestInterval;
    if(clock > maxIntervalClock) {
      this.clock = clock / maxIntervalClock;
      this.timeInterval = smallestInterval;
    } else {
      this.clock = 1;
      this.timeInterval = 1000 / clock;
    }
  }

  executeBatch(): void {
    if(!this.running) {
      return;
    }
    for(let i = 0; i < this.clock; i++) {
      this.counter += 1;
      this.computer.executeInstruction();
    }
  }
}