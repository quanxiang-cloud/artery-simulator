import React, { useState, useContext, useEffect } from 'react';
import { getNodeParentIDs } from '@one-for-all/artery-utils';

import { ContourNode, VisibleNode } from '../types';
import { ArteryCtx, ContourNodesContext } from '../contexts';
import RenderContourNode from './render-contour-node';
import Toolbar from './toolbar';

interface Props {
  nodes: VisibleNode[];
  scrolling: boolean;
}

function useContourNodes(nodes: VisibleNode[], isScrolling: boolean): Array<ContourNode> {
  const { artery } = useContext(ArteryCtx);
  const [contourNodes, setContourNodes] = useState<Array<ContourNode>>([]);

  useEffect(() => {
    if (isScrolling) {
      return;
    }

    const _contourNodes = nodes
      .map((node) => {
        const parentIDs = getNodeParentIDs(artery.node, node.id);
        if (!parentIDs) {
          return false;
        }

        const contour: ContourNode = {
          ...node,
          nodePath: parentIDs,
          depth: parentIDs.length,
          area: node.relativeRect.height * node.relativeRect.width,
        };

        return contour;
      })
      .filter((n): n is ContourNode => !!n);

    setContourNodes(_contourNodes);
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
