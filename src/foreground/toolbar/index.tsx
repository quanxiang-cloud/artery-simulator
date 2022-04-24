import React, { useContext, useEffect, useRef, useState } from 'react';
import { usePopper } from '@one-for-all/headless-ui';
import { ShadowNode } from '../../types';
import { ActionsCtx, ArteryCtx } from '../../contexts';
import ParentNodes from './parent-nodes';
import { Node } from '@one-for-all/artery';
import { deleteByID, findNodeByID, insertAfter } from '@one-for-all/artery-utils';
import Icon from '@one-for-all/icon';
import duplicateNode from './duplicate-node';

interface Props {
  shadowNode: ShadowNode;
}

const modifiers = [
  {
    name: 'offset',
    options: {
      offset: [0, 4],
    },
  },
];

// render toolbar on another context to prevent it be covered by shadow node
function ShadowNodeToolbar({ shadowNode }: Props): JSX.Element | null {
  const { referenceRef, Popper, handleMouseEnter, handleMouseLeave, handleClick } = usePopper();
  const containerRef = useRef<HTMLDivElement>(null);
  const { onChange, genNodeID } = useContext(ActionsCtx);
  const { artery } = useContext(ArteryCtx);
  const [currentNode, setCurrentNode] = useState<Node>();

  function handleDelete() {
    const newRoot = deleteByID(artery.node, shadowNode.id);
    onChange({ ...artery, node: newRoot });
  }

  function handleDuplicate() {
    if (!currentNode) {
      return;
    }

    const newNode = duplicateNode(currentNode, genNodeID);
    const newRoot = insertAfter(artery.node, currentNode.id, newNode);
    if (!newRoot) {
      return;
    }
    onChange({ ...artery, node: newRoot });
  }

  useEffect(() => {
    const node = findNodeByID(artery.node, shadowNode.id);
    if (node) {
      setCurrentNode(node);
    }
  }, [artery, shadowNode]);

  if (!currentNode) {
    return null;
  }

  return (
    <div ref={containerRef} className="active-shadow-node-toolbar">
      <span
        // @ts-ignore
        ref={referenceRef}
        className="active-shadow-node-toolbar__parents"
        onMouseEnter={handleMouseEnter()}
        onMouseLeave={handleMouseLeave()}
      >
        {currentNode.label || currentNode.id}
      </span>
      <span onClick={handleDuplicate} className="active-shadow-node-toolbar__action" title="复制">
        <Icon name="content_copy" size={16} />
      </span>
      <span onClick={handleDelete} className="active-shadow-node-toolbar__action" title="删除">
        <Icon name="delete_forever" size={16} />
      </span>
      <Popper container={containerRef.current} placement="bottom-start" modifiers={modifiers}>
        <ParentNodes currentNodeID={shadowNode.id} />
      </Popper>
    </div>
  );
}

export default ShadowNodeToolbar;
