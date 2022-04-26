import React, { useRef, useState } from 'react';
import { useSetRecoilState } from 'recoil';

import ContourNodes from './contour-nodes';
import type { SimulatorReport } from '../types';

import './index.scss';
import { scrollPositionState } from '../atoms';

interface Props {
  report: SimulatorReport;
}

function Foreground({ report }: Props): JSX.Element {
  const timeRef = useRef<number>();
  const [scrolling, setScrolling] = useState(false);
  const onScroll = useSetRecoilState(scrollPositionState);

  function handleScroll(e: React.UIEvent<HTMLDivElement>): void {
    // @ts-ignore
    onScroll({ x: e.target.scrollLeft, y: e.target.scrollTop });

    setScrolling(true);

    clearTimeout(timeRef.current);
    timeRef.current = window.setTimeout(() => {
      setScrolling(false);
    }, 500);
  }

  return (
    <ContourNodes nodes={report.visibleNodes} scrolling={scrolling} />
    // <div className="simulator-foreground" onScroll={handleScroll}>
    //   <div
    //     className="foreground-scroll"
    //     style={{ height: `${report.areaHeight}px`, width: `${report.areaWidth}px` }}
    //   />
    // </div>
  );
}

export default Foreground;
