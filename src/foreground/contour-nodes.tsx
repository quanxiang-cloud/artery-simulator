import React, { useState, useContext, useEffect } from 'react';
import { Artery } from '@one-for-all/artery';
import { findNodeByID, getNodeParentIDs } from '@one-for-all/artery-utils';

import { ContourNode, VisibleNode } from '../types';
import { ArteryCtx } from '../contexts';
import RenderContourNode from './render-contour-node';
import { ContourNodesContext } from './contexts';
import Toolbar from './toolbar';

interface Props {
  nodes: VisibleNode[];
  scrolling: boolean;
}

function isNodeSupportChildren(id: string, artery: Artery): boolean {
  const node = findNodeByID(artery.node, id);
  if (!node) {
    return false;
  }

  // TODO fix this
  return 'name' in node && node.name === 'div';
}

function ContourNodes({ nodes, scrolling }: Props): JSX.Element {
  const { artery } = useContext(ArteryCtx);
  const [contourNodes, setContourNodes] = useState<Array<ContourNode>>([]);

  useEffect(() => {
    if (scrolling) {
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
          supportChildren: isNodeSupportChildren(node.id, artery),
        };

        return contour;
      })
      .filter((n): n is ContourNode => !!n);

    setContourNodes(_contourNodes);
  }, [nodes, scrolling]);

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
