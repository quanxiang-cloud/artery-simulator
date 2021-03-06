import { useContext, useEffect } from 'react';
import { HTMLNode, ReactComponentNode } from '@one-for-all/artery-renderer';

import { cacheIsNodeSupportChildren, getIsNodeSupportCache } from '../../utils';
import { ArteryCtx } from '../../contexts';

export function useSupportChildrenCheck(node: ReactComponentNode | HTMLNode): void {
  const { isNodeSupportChildren } = useContext(ArteryCtx);

  useEffect(() => {
    const flag = getIsNodeSupportCache(node);
    if (flag !== undefined) {
      return;
    }

    isNodeSupportChildren?.(node)
      .then((flag) => {
        cacheIsNodeSupportChildren(node, flag);
      })
      .catch(() => { });
  }, []);
}
