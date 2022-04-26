import { Node } from '@one-for-all/artery';
import { getNodeParents } from '@one-for-all/artery-utils';
import React, { useContext, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { hoveringParentIDState } from '../../atoms';
import { ArteryCtx } from '../../contexts';

interface Props {
  currentNodeID: string;
}

function ParentNodes({ currentNodeID }: Props): JSX.Element | null {
  const { artery, setActiveNode } = useContext(ArteryCtx);
  const [parents, setParents] = useState<Node[]>([]);
  const setHoveringParentID = useSetRecoilState(hoveringParentIDState);

  useEffect(() => {
    const _parents = getNodeParents(artery.node, currentNodeID);

    // remove root, and just show the max 5 level parent
    setParents(_parents?.slice(1).reverse().slice(0, 5) || []);
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
            onMouseEnter={() => {
              setHoveringParentID(id);
            }}
            onMouseLeave={() => {
              setHoveringParentID('');
            }}
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
