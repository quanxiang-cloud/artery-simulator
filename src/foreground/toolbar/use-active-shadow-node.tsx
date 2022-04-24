import { useContext, useEffect, useState } from 'react';
import { ShadowNode } from '../../types';
import { ArteryCtx } from '../../contexts';
import { ShadowNodesContext } from '../contexts';

export function useActiveShadowNode() {
  const { activeNode } = useContext(ArteryCtx);
  const shadowNodes = useContext(ShadowNodesContext);
  const [activeShadowNode, setActiveNode] = useState<ShadowNode>();

  useEffect(() => {
    if (!activeNode) {
      setActiveNode(undefined);
      return;
    }

    setActiveNode(shadowNodes.find(({ id }) => id === activeNode.id));
  }, [activeNode, shadowNodes]);

  return activeShadowNode;
}
