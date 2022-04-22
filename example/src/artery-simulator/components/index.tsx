import React, { useState } from 'react';
import ArterySimulator from '@one-for-all/artery-simulator';

import repository from './repository';
import arteryForTestingSimulator from './artery-for-testing-simulator';
import ArterySpec from '@one-for-all/artery';
import { isSupportChildren } from './heler';

function Placeholder(): JSX.Element {
  return <div>请拖拽元素到此处！</div>;
}

function SimulatorInExample(): JSX.Element {
  const [activeNode, setActiveNode] = useState<ArterySpec.Node>();
  const [artery, setArtery] = useState(arteryForTestingSimulator);

  return (
    <ArterySimulator
      artery={artery}
      plugins={{ repository }}
      activeNode={activeNode}
      setActiveNode={setActiveNode}
      onChange={setArtery}
      isNodeSupportChildren={isSupportChildren}
      emptyChildrenPlaceholder={Placeholder}
    />
  );
}

export default SimulatorInExample;
