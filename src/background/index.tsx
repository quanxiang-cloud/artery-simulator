import React, { useRef, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { Plugins, useBootResult } from '@one-for-all/artery-renderer';
import { Artery } from '@one-for-all/artery';

import NodeRender from './node-render';
import useVisibleObserver from './use-visible-observer';
import { VisibleObserverCTX } from './contexts';
import type { SimulatorReport } from '../types';
import { scrollPositionState } from '../atoms';

interface Props {
  artery: Artery;
  plugins?: Plugins;
  onReport: (report: SimulatorReport) => void;
}

function Background({ artery, plugins, onReport }: Props): JSX.Element | null {
  const { ctx, rootNode } = useBootResult(artery, plugins) || {};
  const backgroundRef = useRef<HTMLDivElement>(null);
  const visibleObserver = useVisibleObserver(onReport, backgroundRef.current);
  const [scrollPosition] = useRecoilState(scrollPositionState);

  useEffect(() => {
    if (!backgroundRef.current) {
      return;
    }

    backgroundRef.current.scrollLeft = scrollPosition.x;
    backgroundRef.current.scrollTop = scrollPosition.y;
  }, [scrollPosition]);

  if (!ctx || !rootNode) {
    return null;
  }

  return (
    <div ref={backgroundRef} className="simulator-background">
      <VisibleObserverCTX.Provider value={visibleObserver}>
        <NodeRender node={rootNode} ctx={ctx} />
      </VisibleObserverCTX.Provider>
    </div>
  );
}

export default Background;
