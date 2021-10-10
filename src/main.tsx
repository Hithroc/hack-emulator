import { h, Component, render } from 'preact';
import { Controls, Display, ExecState, Memory } from './io';
import { ComputerRunner, ppInstruction, parseInstruction, asm } from './computer';
import './styles.css'
import Split from 'react-split';
import { ComputerState } from './io/computerstate';


type AppState = {
  code: string;
  highlightedInstruction: number;
}
type AppProps = Record<string, never>

class App extends Component<AppProps, AppState> {
  computer = new ComputerRunner();
  constructor(props : AppProps) {
    super(props);
    this.setState({ code : "", highlightedInstruction: 0 });
  }
  handleInput (e : h.JSX.TargetedEvent<HTMLTextAreaElement, Event>) {
    if(e.target !== null) {
      const newValue = (e.target as HTMLTextAreaElement).value;
      this.textChange(newValue);
    }
  }
  textChange(e : string) {
    this.setState(prevState => ({...prevState, code : e}))
  }

  load() {
    const asmed = asm(this.state.code);
    console.log(asmed);
    const lines = asmed.split('\n');
    for(let i = 0; i < lines.length; i++) {
      this.computer.computer.rom[i] = parseInt(lines[i], 2);
    }
    this.computer.reset();
    this.updateHighlight();
  }

  step() {
    this.computer.step();
    this.updateHighlight();
  }

  updateHighlight() {
    this.setState(prevState =>
      ({...prevState, highlightedInstruction: this.computer.computer.pc})
    );
  }

  componentDidMount() {
    this.computer.loop(() => this.updateHighlight());
  }

  runPause(state : ExecState) {
    switch(state) {
      case "running":
        this.computer.run();
        break;
      case "paused":
        this.computer.pause();
    }
  }

  ppROM(i : number) {
    const inst = parseInstruction(i);
    return `${i.toString(2).padStart(16, "0")} ${ppInstruction(inst)}\n`;
  }

  render() {
    return (
      <Split 
        className="top-level"
        sizes={[20, 30, 10, 40]}
        snapOffset={0}
        minSize={[0, 0, 0, 550]}
        >
        <div class="column">
          <div class="column-title">CODE</div>
          <button class="load" onClick={() => this.load()}>Load<br />--{'>'}</button>
          <textarea class="code-input" value={this.state.code} onInput={e => this.handleInput(e)} />
        </div>
        <div class="column">
          <div class="column-title">ROM</div>
          <Memory arr={this.computer.computer.rom} prettyPrinter={i => this.ppROM(i)} highlight={this.state.highlightedInstruction}></Memory>
        </div>
        <div class="column">
          <div class="column-title">RAM</div>
          <Memory arr={this.computer.computer.ram} prettyPrinter={i => i.toString()}></Memory>
        </div>
        <div class="column io">
          <div class="column-title">I/O</div>
          <Display imgData={this.computer.computer.screenSlice()} kbData={this.computer.computer.keyboardSlice()} />
          <Controls onStep={() => this.step()} onStateChange={s => this.runPause(s)} onReset={() => {this.computer.reset()}} onClockChange={clock => this.computer.setClock(clock)} measuredSpeed={this.computer.measuredSpeed} />
          <ComputerState
            regA={this.computer.computer.regA}
            regM={this.computer.computer.ram[this.computer.computer.regA]}
            regD={this.computer.computer.regD}
            currentInstruction={this.computer.computer.rom[this.computer.computer.pc]}
            / >
        </div>
      </Split>
    )
  }
}

render(<App />, document.body);