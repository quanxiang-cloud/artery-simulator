import React, { useRef, useState } from 'react';

import ShadowNodes from './shadow-nodes';
import { SimulatorReport } from '../types';

import './index.scss';

interface Props {
  report: SimulatorReport;
  onScroll: (position: { x: number; y: number }) => void;
}

function Foreground({ report, onScroll }: Props): JSX.Element {
  const timeRef = useRef<number>();
  const [scrolling, setScrolling] = useState(false);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    // @ts-ignore
    onScroll({ x: e.target.scrollLeft, y: e.target.scrollTop });

    setScrolling(true);

    clearTimeout(timeRef.current);
    timeRef.current = window.setTimeout(() => {
      setScrolling(false);
    }, 50);
  }

  return (
    <div className="simulator-foreground" onScroll={handleScroll}>
      <div
        className="foreground-scroll"
        style={{ height: `${report.areaHeight}px`, width: `${report.areaWidth}px` }}
      />
      <ShadowNodes nodes={report.visibleNodes} scrolling={scrolling} />
    </div>
  );
}

export default Foreground;
