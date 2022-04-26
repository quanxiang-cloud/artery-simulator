import { useRecoilState, useSetRecoilState } from 'recoil';
import React, { useState, useEffect, useMemo } from 'react';
import { parent } from '@one-for-all/artery-utils';

import { ContourNode, VisibleNode } from '../types';
import RenderContourNode from './render-contour-node';
import Toolbar from './toolbar';
import { contourNodesState, immutableNodeState } from '../atoms';

interface Props {
  nodes: VisibleNode[];
  scrolling: boolean;
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

    // const n1 = performance.now();

    const _contourNodes = nodes
      .map((node) => {
        // todo performance issue
        if (!nodeDepthCache.has(node.id)) {
          const parentKeyPath = parent(immutableNode, node.id);
          nodeDepthCache.set(node.id, parentKeyPath?.size || 0);
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
    // const n2 = performance.now();
    // console.log('calc nodes cost:', n2 - n1);
  }, [nodes, isScrolling]);

  return contourNodes;
}

function ContourNodes({ nodes, scrolling }: Props): JSX.Element {
  const contourNodes = useContourNodes(nodes, scrolling);

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
              key={contour.id}
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
