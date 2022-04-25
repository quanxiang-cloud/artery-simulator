import React, { useState, useContext, useEffect } from 'react';
import { parent } from '@one-for-all/artery-utils';

import { ContourNode, VisibleNode } from '../types';
import { ArteryCtx, ContourNodesContext } from '../contexts';
import RenderContourNode from './render-contour-node';
import Toolbar from './toolbar';

interface Props {
  nodes: VisibleNode[];
  scrolling: boolean;
}

function useContourNodes(nodes: VisibleNode[], isScrolling: boolean): Array<ContourNode> {
  const { immutableNode } = useContext(ArteryCtx);
  const [contourNodes, setContourNodes] = useState<Array<ContourNode>>([]);

  useEffect(() => {
    if (isScrolling) {
      return;
    }

    const n1 = performance.now();

    const _contourNodes = nodes
      .map((node) => {
        // todo performance issue
        const parentKeyPath = parent(immutableNode, node.id);
        const contour: ContourNode = {
          ...node,
          // depth: parentIDs.length,
          depth: parentKeyPath?.size || 0,
          area: node.relativeRect.height * node.relativeRect.width,
        };

        return contour;
      })
      .filter((n): n is ContourNode => !!n);

    setContourNodes(_contourNodes);
    const n2 = performance.now();
    console.log('calc nodes cost:', n2 - n1);
  }, [nodes, isScrolling]);

  return contourNodes;
}

function ContourNodes({ nodes, scrolling }: Props): JSX.Element {
  const contourNodes = useContourNodes(nodes, scrolling);

  return (
    <ContourNodesContext.Provider value={contourNodes}>
      <div className="contour-nodes">
        {contourNodes.map((contour) => {
          return <RenderContourNode key={contour.id} contourNode={contour} />;
        })}
      </div>
      <Toolbar />
    </ContourNodesContext.Provider>
  );
}

export default ContourNodes;
