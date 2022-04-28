import { useRecoilState, useSetRecoilState } from 'recoil';
import React, { useState, useEffect, useMemo } from 'react';
import { keyPathById } from '@one-for-all/artery-utils';

import { ContourNode, VisibleNode } from '../types';
import RenderContourNode from './render-contour-node';
import Toolbar from './toolbar';
import { contourNodesState, immutableNodeState, isScrollingState } from '../atoms';

interface Props {
  nodes: VisibleNode[];
}

function useContourNodes(nodes: VisibleNode[], isScrolling: boolean): Array<ContourNode> {
  const [immutableNode] = useRecoilState(immutableNodeState);
  const [contourNodes, setContourNodes] = useState<Array<ContourNode>>([]);
  const nodeDepthCache = useMemo(() => {
    return new Map<string, number>();
  }, [immutableNode]);

  useEffect(() => {
    if (isScrolling) {
      return;
    }

    const _contourNodes = nodes
      .map((node) => {
        // todo performance issue
        if (!nodeDepthCache.has(node.id)) {
          const keyPath = keyPathById(immutableNode, node.id);
          nodeDepthCache.set(node.id, keyPath?.size || 0);
        }

        const depth = nodeDepthCache.get(node.id) || 0;

        const contour: ContourNode = {
          ...node,
          // depth: parentIDs.length,
          depth: depth,
          area: node.relativeRect.height * node.relativeRect.width,
        };

        return contour;
      })
      .filter((n): n is ContourNode => !!n);

    setContourNodes(_contourNodes);
  }, [nodes, isScrolling]);

  return contourNodes;
}

function ContourNodes({ nodes }: Props): JSX.Element {
  const [isScrolling] = useRecoilState(isScrollingState);
  const contourNodes = useContourNodes(nodes, isScrolling);

  const setContourNodesState = useSetRecoilState(contourNodesState);
  useEffect(() => {
    setContourNodesState(contourNodes);
  }, [contourNodes]);

  return (
    <>
      <div className="contour-nodes">
        {contourNodes.map((contour) => {
          return (
            <RenderContourNode
              key={`contour-${contour.id}`}
              contourNode={contour}
            />
          );
        })}
      </div>
      <Toolbar />
    </>
  );
}

export default ContourNodes;
