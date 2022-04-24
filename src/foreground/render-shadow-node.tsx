import React, { useContext } from 'react';
import cs from 'classnames';

import { Position, ShadowNode } from '../types';
import { ActionsCtx, ArteryCtx, IndicatorCTX } from '../contexts';
import { debounce } from '../utils';
import calcGreenZone from './calc-green-zone';
import { ShadowNodesContext } from './contexts';
import useShadowNodeStyle from './use-shadow-node-style';
import { moveNode } from './helper';

function preventDefault(e: any): false {
  e.preventDefault();
  return false;
}

interface Props {
  shadowNode: ShadowNode;
  onClick: () => void;
  isActive: boolean;
  className?: string;
}

function RenderShadowNode({
  shadowNode,
  onClick,
  isActive,
  className,
}: // onDrop,
Props): JSX.Element {
  const { id } = shadowNode;
  const { rootNodeID, artery } = useContext(ArteryCtx);
  const { onChange } = useContext(ActionsCtx);
  const style = useShadowNodeStyle(shadowNode);
  const shadowNodes = useContext(ShadowNodesContext);
  const { setGreenZone, greenZone, setShowIndicator } = useContext(IndicatorCTX);

  const handleDrag = debounce((e) => {
    const greenZone = calcGreenZone({ x: e.clientX, y: e.clientY, nodeID: id }, shadowNodes);
    setGreenZone(greenZone);
  });

  function handleDrop(e: React.UIEvent): boolean {
    e.preventDefault();
    e.stopPropagation();
    if (!greenZone) {
      return false;
    }

    const newRoot = moveNode(artery.node, greenZone.draggingNodeID, greenZone.hoveringNodeID, greenZone.position);
    if (newRoot) {
      onChange({ ...artery, node: newRoot });
    }

    // reset green zone to undefine to prevent green zone first paine flash
    setGreenZone(undefined);
    return false;
  }

  return (
    <div
      draggable={id !== rootNodeID}
      onDragStart={() => setShowIndicator(true)}
      onDragEnd={() => setShowIndicator(false)}
      onDrag={handleDrag}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDrop={handleDrop}
      key={id}
      style={style}
      onClick={onClick}
      className={cs('shadow-node', className, {
        'shadow-node--root': rootNodeID === id,
        'shadow-node--active': isActive,
      })}
    >
      {/* <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span>{id}</span>
      </div> */}
    </div>
  );
}

export default RenderShadowNode;
