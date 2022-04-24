import { useContext, useEffect, useState } from 'react';
import { ContourNode } from '../../types';
import { ArteryCtx, ContourNodesContext } from '../../contexts';

export function useActiveContourNode(): ContourNode | undefined {
  const { activeNode } = useContext(ArteryCtx);
  const contourNodes = useContext(ContourNodesContext);
  const [activeContourNode, setActiveNode] = useState<ContourNode>();

  useEffect(() => {
    if (!activeNode) {
      setActiveNode(undefined);
      return;
    }

    setActiveNode(contourNodes.find(({ id }) => id === activeNode.id));
  }, [activeNode, contourNodes]);

  return activeContourNode;
}
