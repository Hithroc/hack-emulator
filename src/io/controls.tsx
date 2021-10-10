import { h } from 'preact';
import { useState } from 'preact/hooks';
import { LogSlider } from '../util/logslider';

export type ExecState = "paused" | "running";
function flipState(state: ExecState): ExecState { return state === "running" ? "paused" : "running"; }
function ppExecButton(state : ExecState): string {
  switch(state) {
    case "running": {
      return "Pause";
    }
    case "paused": {
      return "Run";
    }
  }
}

type ControlsProps = {
  onClockChange : (i : number) => void;
  onStateChange : (state : ExecState) => void;
  onStop : () => void;
  onStep : () => void;
  measuredSpeed : number;
}

export function Controls(props: ControlsProps): h.JSX.Element {
  const [runState, setRunState] = useState<ExecState>("paused");
  const [clock, setClock] = useState(1);

  const handleClockChange = (i : number) => {
    setClock(i);
    props.onClockChange(i);
  };

  const handleStateChange = () => {
    const newState = flipState(runState);
    setRunState(newState);
    props.onStateChange(newState);
  };

  const handleStop = () => {
    setRunState("paused");
    props.onStateChange("paused")
    props.onStop();
  };
  
  const ppClock = (clock : number) => {
    const units = ["kHz", "MHz", "GHz"]
    const unit = units.reduce((prev, cur) => {
      if(clock >= 1000) {
        clock /= 1000;
        return cur;
      } else {
        return prev;
      }
    }, "Hz");
    return clock.toFixed(2) + unit;
  };

  return (
    <div class="controls">
      <LogSlider lowBound={1} highBound={100000000} resolution={1000} onChange={i => handleClockChange(i)} /><div>{ppClock(clock)} <abbr title="Measured speed">({ppClock(props.measuredSpeed)})</abbr></div>
      <button class="play-pause" style="width:50px;" onClick={() => handleStateChange()}>{ppExecButton(runState)}</button>
      <button class="step" onClick={() => props.onStep()} disabled={runState == "running"}>Step</button>
      <button class="stop" onClick={() => handleStop()} disabled={runState == "paused"}>Stop</button>
    </div>
  );
}