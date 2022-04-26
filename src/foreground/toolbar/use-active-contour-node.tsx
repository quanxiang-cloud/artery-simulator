import { useContext, useEffect, useState } from 'react';
import { ContourNode } from '../../types';
import { ArteryCtx } from '../../contexts';
import { useRecoilState } from 'recoil';
import { contourNodesState } from '../../atoms';

export function useActiveContourNode(): ContourNode | undefined {
  const { activeNode } = useContext(ArteryCtx);
  const [activeContourNode, setActiveNode] = useState<ContourNode>();

  const [contourNodes] = useRecoilState(contourNodesState);

  useEffect(() => {
    if (!activeNode) {
      setActiveNode(undefined);
      return;
    }

    setActiveNode(contourNodes.find(({ id }) => id === activeNode.id));
  }, [activeNode, contourNodes]);

  return activeContourNode;
}
