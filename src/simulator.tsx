import React, { useEffect, useState } from 'react';
import cs from 'classnames';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { fromJS } from 'immutable';
import { Plugins } from '@one-for-all/artery-renderer';
import { Artery, Node } from '@one-for-all/artery';

import Background from './background';
import Foreground from './foreground';
import { ArteryCtx } from './contexts';
import { NodeWithoutChild, SimulatorReport } from './types';
import { AllElementsCTX } from './background/contexts';
import RenderGreenZone from './green-zone';
import './index.scss';
import { greenZoneState, immutableNodeState, isDraggingOverState } from './atoms';

export interface Props {
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
  onChange,

  className,
  setActiveNode,
  activeNode,

  plugins,
  genNodeID,
  isNodeSupportChildren,
  onDropFile,
}: Props): JSX.Element {
  const [report, setReport] = useState<SimulatorReport>();
  const [isDraggingOver] = useRecoilState(isDraggingOverState);
  const setImmutableNode = useSetRecoilState(immutableNodeState);
  // todo move this into RenderGreenZone
  const [greenZone] = useRecoilState(greenZoneState);

  useEffect(() => {
    setImmutableNode(fromJS(artery.node));
  }, [artery.node]);

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
      <AllElementsCTX.Provider value={ALL_ELEMENTS}>
        <div className={cs('artery-simulator-root', className)}>
          <Background
            onReport={setReport}
            artery={artery}
            plugins={plugins}
          />
          {report && <Foreground report={report} />}
          {isDraggingOver && greenZone && <RenderGreenZone greenZone={greenZone} />}
        </div>
      </AllElementsCTX.Provider>
    </ArteryCtx.Provider>
  );
}

export default Simulator;
