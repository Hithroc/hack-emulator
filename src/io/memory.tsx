import { createRef, h } from 'preact';
import { useEffect } from 'preact/hooks';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';


type MemoryProps = {
  arr : Uint16Array;
  prettyPrinter : (i : number) => string;
  highlight?: number;
}

export function Memory(props : MemoryProps): h.JSX.Element {

  // Scroll to highlighted cell
  const virtuoso = createRef<VirtuosoHandle>();
  useEffect(() => {
    if(props.highlight !== undefined && virtuoso.current!== null) {
      const pagedHighlight = props.highlight - props.highlight % 20;
      virtuoso.current.scrollToIndex({ index: pagedHighlight })
    }
  }, [props.highlight]);

  function MemoryCell(index : number) {
    const doEven = index % 2 == 0 ? " memory-even" : "";
    const doHighlight = props.highlight === index ? " memory-highlight" : doEven;
    return (
      <div class={"memory" + doHighlight}>
        <div class="memory-ix">{index}</div>
        <div class="memory-content">{props.prettyPrinter(props.arr[index])}</div>
      </div>
    );
  }
  return (
    <Virtuoso
      ref={virtuoso}
      totalCount={props.arr.length}
      itemContent={MemoryCell}
    />
  );
}