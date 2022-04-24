import { Node } from '@one-for-all/artery';
import { getNodeParents } from '@one-for-all/artery-utils';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ArteryCtx } from '../../contexts';

interface Props {
  currentNodeID: string;
}

function ParentNodes({ currentNodeID }: Props): JSX.Element | null {
  const { artery, setActiveNode } = useContext(ArteryCtx);
  const [parents, setParents] = useState<Node[]>([]);

  useEffect(() => {
    const _parents = getNodeParents(artery.node, currentNodeID);

    setParents(_parents?.slice(0, 5).reverse() || []);
  }, [artery]);

  if (!parents.length) {
    return null;
  }

  return (
    <div className="active-node-parents">
      {parents.map((parent) => {
        const { id, label } = parent;
        return (
          <span
            key={id}
            className="active-node-parents__parent"
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(parent);
            }}
          >
            {label || id}
          </span>
        );
      })}
    </div>
  );
}

export default ParentNodes;
