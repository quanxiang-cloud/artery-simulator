import React, { useState } from 'react';
import cs from 'classnames';
import { Plugins } from '@one-for-all/artery-renderer';
import { Artery, Node } from '@one-for-all/artery';

import Background from './background';
import Foreground from './foreground';
import { ArteryCtx, IndicatorCTX } from './contexts';
import { GreenZone, NodeWithoutChild, SimulatorReport } from './types';
import { AllElementsCTX } from './background/contexts';
import RenderGreenZone from './green-zone';
import './index.scss';

interface Props {
  artery: Artery;
  setActiveNode: (node?: Node) => void;
  onChange: (artery: Artery) => void;
  activeNode?: Node;
  plugins?: Plugins;
  className?: string;
  genNodeID: () => string;
  isNodeSupportChildren?: (parent: NodeWithoutChild) => Promise<boolean>;
  onDropFile?: (file: File) => Promise<string>;
}

const ALL_ELEMENTS = new Map();

function Simulator({
  artery,
  plugins,
  className,
  setActiveNode,
  activeNode,
  genNodeID,
  isNodeSupportChildren,
  onDropFile,
  onChange,
}: Props): JSX.Element {
  const [report, setReport] = useState<SimulatorReport>();
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [greenZone, setGreenZone] = useState<GreenZone>();
  const [isShowIndicator, setShowIndicator] = useState(false);
  const [draggingNodeID, setDraggingNodeID] = useState<string>();

  // todo fix this
  function optimizedSetGreenZone(newZone?: GreenZone): void {
    if (newZone?.hoveringNodeID !== greenZone?.hoveringNodeID || newZone?.position !== greenZone?.position) {
      setGreenZone(newZone);
    }
  }

  return (
    <ArteryCtx.Provider
      value={{
        artery,
        rootNodeID: artery.node.id,
        activeNode,
        setActiveNode,
        isNodeSupportChildren,
        onDropFile,
        onChange,
        genNodeID,
      }}
    >
      <IndicatorCTX.Provider
        value={{
          setGreenZone: optimizedSetGreenZone,
          greenZone,
          setShowIndicator,
          setDraggingNodeID,
          draggingNodeID,
        }}
      >
        <AllElementsCTX.Provider value={ALL_ELEMENTS}>
          <div className={cs('artery-simulator-root', className)}>
            <Background
              onReport={setReport}
              artery={artery}
              plugins={plugins}
              scrollPosition={scrollPosition}
            />
            {report && <Foreground report={report} onScroll={setScrollPosition} />}
            {isShowIndicator && greenZone && <RenderGreenZone greenZone={greenZone} />}
          </div>
        </AllElementsCTX.Provider>
      </IndicatorCTX.Provider>
    </ArteryCtx.Provider>
  );
}

export default Simulator;
