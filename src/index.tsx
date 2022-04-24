import React, { ComponentClass, FunctionComponent, useState } from 'react';
import cs from 'classnames';
import { Plugins } from '@one-for-all/artery-renderer';
import ArterySpec, { Artery, HTMLNode, ReactComponentNode } from '@one-for-all/artery';

import Background from './background';
import Foreground from './foreground';
import { ArteryCtx, IndicatorCTX, ActionsCtx } from './contexts';
import { EmptyChildPlaceholder, GreenZone, NodeWithoutChild, SimulatorReport } from './types';
import { AllElementsCTX } from './background/contexts';
import { findNodeByID } from '@one-for-all/artery-utils';
import RenderGreenZone from './green-zone';
import './index.scss';

interface Props {
  artery: ArterySpec.Artery;
  setActiveNode: (node: ArterySpec.Node) => void;
  onChange: (artery: Artery) => void;
  activeNode?: ArterySpec.Node;
  className?: string;
  plugins?: Plugins;
  emptyChildrenPlaceholder?: EmptyChildPlaceholder;
  isNodeSupportChildren?: (parent: NodeWithoutChild) => Promise<boolean>;
  onDropFile?: (file: File) => Promise<string>;
  genNodeID: () => string;
}

const ALL_ELEMENTS = new Map();

function Simulator({
  artery,
  plugins,
  className,
  setActiveNode,
  activeNode,
  genNodeID,
  emptyChildrenPlaceholder,
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
    <ArteryCtx.Provider value={{ artery, rootNodeID: artery.node.id, activeNode, setActiveNode }}>
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
          <ActionsCtx.Provider
            value={{ emptyChildrenPlaceholder, isNodeSupportChildren, onDropFile, onChange, genNodeID }}
          >
            <div className={cs('artery-simulator-root', className)}>
              <Background
                onReport={setReport}
                artery={artery}
                plugins={plugins}
                scrollPosition={scrollPosition}
              />
              {report && (
                <Foreground
                  report={report}
                  onScroll={setScrollPosition}
                />
              )}
              {isShowIndicator && greenZone && <RenderGreenZone greenZone={greenZone} />}
            </div>
          </ActionsCtx.Provider>
        </AllElementsCTX.Provider>
      </IndicatorCTX.Provider>
    </ArteryCtx.Provider>
  );
}

export default Simulator;
