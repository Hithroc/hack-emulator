import { h } from 'preact';
import { parseInstruction, ppComp } from '../computer/instruction';

type ComputerStateProps = {
  currentInstruction : number;
  regD : number;
  regA : number;
  regM : number;
}

export function ComputerState(props : ComputerStateProps): h.JSX.Element {
  let comp = "-";
  const inst = parseInstruction(props.currentInstruction);
  switch(inst.type) {
    case "C": {
      comp = ppComp(inst.comp, inst.a);
      break;
    }
    case "A": {
      break;
    }
  }
  return (
    <div class="computer-state">
      <div>A: {props.regA}</div>
      <div>M: {props.regM}</div>
      <div>D: {props.regD}</div>
      <div>ALU: {comp}</div>
    </div>
  );
}