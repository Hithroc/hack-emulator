import { Component, createRef, h } from 'preact';

const kbMap = {
  "Space": 32,
  "!": 33, "\"": 34, "#": 35, "$": 36, "%": 37, "&": 38, "'": 39, "(": 40, ")": 41, "*": 42, "+": 43, ",": 44, "-": 45, ".": 46, "/": 47,
  "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57,
  "A": 65, "B": 66, "C": 67, "D": 68, "E": 69, "F": 70, "G": 71, "H": 72, "I": 73, "J": 74, "K": 75, "L": 76, "M": 77, "N": 78, "O": 79, "P": 80, "Q": 81, "R": 82, "S": 83, "T": 84, "U": 85, "V": 86, "W": 87, "X": 88, "Y": 89, "Z": 90,
  "[": 91, "\\": 92, "]": 93, "^": 94, "_": 95, "`": 96,
  "a": 97, "b": 98, "c": 99, "d": 100, "e": 101, "f": 102, "g": 103, "h": 104, "i": 105, "j": 106, "k": 107, "l": 108, "m": 109, "n": 110, "o": 111, "p": 112, "q": 113, "r": 114, "s": 115, "t": 116, "u": 117, "v": 118, "w": 119, "x": 120, "y": 121, "z": 122,
  "{": 123, "|": 124, "}": 125, "~": 126,
  "Enter": 128, "Backspace": 129, "ArrowLeft": 130, "ArrowUp": 131, "ArrowRight": 132, "ArrowDown": 133, "Home": 134, "End": 135, "PageUp": 136, "PageDown": 137, "Insert": 138, "Delete": 139, "Escape": 140,
  "F1": 141, "F2": 142, "F3": 143, "F4": 144, "F5": 145, "F6": 146, "F7": 147, "F8": 148, "F9": 149, "F10": 150, "F11": 151, "F12": 152
}

type DisplayProps = {
  imgData : Uint16Array;
  kbData : Uint16Array;
};

type DisplayState = Record<string, never>;

export class Display extends Component<DisplayProps, DisplayState> {
  canvas = createRef<HTMLCanvasElement>();

  constructor(props : DisplayProps) {
    super(props);
  }

  updateCanvas(): void {
    const ctx = this.canvas.current?.getContext("2d");
    if(ctx === null || ctx === undefined) {
      alert(ctx);
      return;
    }
    const data = this.props.imgData;
    const imgData = new Uint8ClampedArray(data.length*16*4);
    for(let i = 0; i < data.length; i++) {
      let n = data[i];
      for(let j = 0; j < 16; j++) {
        const c = 255 * (n & 1);
        const ix = 4*(i*16+j);
        imgData[ix] = c;
        imgData[ix+1] = c;
        imgData[ix+2] = c;
        imgData[ix+3] = 255;
        n >>= 1;
      }
    }
    ctx.putImageData(new ImageData(imgData, 512, 256), 0, 0);
    requestAnimationFrame(() => this.updateCanvas());
  }

  componentDidMount(): void {
    this.updateCanvas();
  }

  handleKeyDown(e : h.JSX.TargetedKeyboardEvent<HTMLCanvasElement>): void {
    e.preventDefault();
    if(e.repeat) { return; }
    if(e.key in kbMap) {
      this.props.kbData[0] = kbMap[e.key as keyof typeof kbMap];
    }
  }

  handleKeyUp(e : h.JSX.TargetedKeyboardEvent<HTMLCanvasElement>): void {
    if(e.key in kbMap) {
      const code = kbMap[e.key as keyof typeof kbMap];
      if(code == this.props.kbData[0]) {
        this.props.kbData[0] = 0;
      }
    }
  }

  render(): h.JSX.Element {
    return (
      <div>
        <div>Click on the screen to capture keyboard</div>
        <canvas class="display" tabIndex={-1} ref={this.canvas} width={512} height={256}
                onKeyUp={e => this.handleKeyUp(e)} onKeyDown={e => this.handleKeyDown(e)}/>
      </div>
    );
  }
}

