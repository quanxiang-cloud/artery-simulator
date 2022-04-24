import React, { useState, useContext, useEffect } from 'react';
import { Artery } from '@one-for-all/artery';
import { findNodeByID, getNodeParentIDs } from '@one-for-all/artery-utils';

import { ShadowNode, VisibleNode } from '../types';
import { ArteryCtx } from '../contexts';
import RenderShadowNode from './render-shadow-node';
import { ShadowNodesContext } from './contexts';
import Toolbar from './toolbar';

interface Props {
  nodes: VisibleNode[];
}

function isNodeSupportChildren(id: string, artery: Artery): boolean {
  const node = findNodeByID(artery.node, id);
  if (!node) {
    return false;
  }

  // TODO fix this
  return 'name' in node && node.name === 'div';
}

function ShadowNodes({ nodes }: Props): JSX.Element {
  const { artery } = useContext(ArteryCtx);
  const [shadowNodes, setShadowNodes] = useState<Array<ShadowNode>>([]);

  useEffect(() => {
    console.log('run effect')
    const _shadowNodes = nodes
      .map((node) => {
        const parentIDs = getNodeParentIDs(artery.node, node.id);
        if (!parentIDs) {
          return false;
        }

        const shadowNode: ShadowNode = {
          ...node,
          nodePath: parentIDs,
          depth: parentIDs.length,
          area: node.relativeRect.height * node.relativeRect.width,
          supportChildren: isNodeSupportChildren(node.id, artery),
        };

        return shadowNode;
      })
      .filter((n): n is ShadowNode => !!n);

    setShadowNodes(_shadowNodes);
  }, [nodes]);

  return (
    <ShadowNodesContext.Provider value={shadowNodes}>
      <div className="shadow-nodes">
        {shadowNodes.map((shadowNode) => {
          return (
            <RenderShadowNode
              key={shadowNode.id}
              shadowNode={shadowNode}
            />
          );
        })}
      </div>
      <Toolbar />
    </ShadowNodesContext.Provider>
  );
}

export default ShadowNodes;
