import React, { useContext, useRef } from 'react';
import { usePopper } from '@one-for-all/headless-ui';
import { ShadowNode } from '../../types';
import { ActionsCtx, ArteryCtx } from '../../contexts';
import ParentNodes from './parent-nodes';
import { deleteByID, findNodeByID, insertAfter } from '@one-for-all/artery-utils';
import Icon from '@one-for-all/icon';
import duplicateNode from './duplicate-node';
import { useActiveShadowNode } from './use-active-shadow-node';
import useToolbarStyle from './use-toolbar-style';

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
function ShadowNodeToolbar(): JSX.Element | null {
  const { activeNode } = useContext(ArteryCtx);
  const shadowNode = useActiveShadowNode();
  const { referenceRef, Popper, handleMouseEnter, handleMouseLeave, handleClick } = usePopper();
  const containerRef = useRef<HTMLDivElement>(null);
  const { onChange, genNodeID } = useContext(ActionsCtx);
  const { artery, setActiveNode } = useContext(ArteryCtx);
  const style = useToolbarStyle(shadowNode);

  function handleDelete() {
    if (!shadowNode) {
      return;
    }

    const newRoot = deleteByID(artery.node, shadowNode.id);
    onChange({ ...artery, node: newRoot });
    setActiveNode(undefined)
  }

  function handleDuplicate() {
    if (!activeNode) {
      return;
    }

    const newNode = duplicateNode(activeNode, genNodeID);
    const newRoot = insertAfter(artery.node, activeNode.id, newNode);
    if (!newRoot) {
      return;
    }
    onChange({ ...artery, node: newRoot });
    // this really annoying if changed the active node, so comment below line
    // setActiveNode(newNode);
  }

  if (!activeNode || !shadowNode) {
    return null;
  }

  return (
    <div ref={containerRef} className="active-shadow-node-toolbar" style={style}>
      <span
        // @ts-ignore
        ref={referenceRef}
        className="active-shadow-node-toolbar__parents"
        // onClick={handleClick()}
        onMouseEnter={handleMouseEnter()}
        onMouseLeave={handleMouseLeave()}
      >
        {activeNode.label || activeNode.id}
      </span>
      <span onClick={handleDuplicate} className="active-shadow-node-toolbar__action" title="复制">
        <Icon name="content_copy" size={16} />
      </span>
      <span onClick={handleDelete} className="active-shadow-node-toolbar__action" title="删除">
        <Icon name="delete_forever" size={16} />
      </span>
      <Popper placement="bottom-start" modifiers={modifiers} container={containerRef.current}>
        <ParentNodes currentNodeID={shadowNode.id} />
      </Popper>
    </div>
  );
}

export default ShadowNodeToolbar;
