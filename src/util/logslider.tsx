import { Component, h } from 'preact';
import { useState } from 'preact/hooks';

type LogSliderProp = {
  lowBound : number,
  highBound : number,
  resolution : number
  onChange : (i : number) => void
}

export function LogSlider(props : LogSliderProp) {
  const [value, setValue] = useState(0);
  function sendInput(e : h.JSX.TargetedEvent<HTMLInputElement, Event>) {
    if(e.target !== null) {
      let newValue = parseInt((e.target as HTMLInputElement).value);
      setValue(newValue);
      let scale = Math.log10(props.highBound) - Math.log10(props.lowBound);
      let logValue = Math.pow(10, scale / (props.resolution / newValue) + Math.log10(props.lowBound));
      props.onChange(logValue);
    }
  }
  return (
    <input class="logslider" 
           type="range"
           min="0"
           max={props.resolution} 
           value={value}
           onInput={e => sendInput(e)} />
  );
}