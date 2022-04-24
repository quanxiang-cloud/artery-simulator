import React, { useContext } from 'react';
import cs from 'classnames';
import { Artery, Node } from '@one-for-all/artery';

import { Position, ShadowNode } from '../types';
import { ActionsCtx, ArteryCtx, IndicatorCTX } from '../contexts';
import { debounce } from '../utils';
import calcGreenZone from './calc-green-zone';
import { ShadowNodesContext } from './contexts';
import useShadowNodeStyle from './use-shadow-node-style';
import { moveNode, dropNode, jsonParse } from './helper';

function preventDefault(e: any): false {
  e.preventDefault();
  e.stopPropagation();
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
  const { setGreenZone, greenZone, setShowIndicator, setDraggingNodeID, draggingNodeID } =
    useContext(IndicatorCTX);

  const handleDragOver = debounce((e) => {
    setShowIndicator(true);

    const greenZone = calcGreenZone({ x: e.clientX, y: e.clientY }, shadowNodes, draggingNodeID);
    setGreenZone(greenZone);

    return false;
  });

  // todo give this function a better name
  function handleDrop(e: React.DragEvent<HTMLElement>): Artery | undefined {
    setShowIndicator(false);

    if (!greenZone) {
      return;
    }

    // move action
    if (draggingNodeID) {
      const newRoot = moveNode({
        root: artery.node,
        draggingNodeID,
        hoveringNodeID: greenZone.hoveringNodeID,
        position: greenZone.position,
      });

      if (newRoot) {
        return  { ...artery, node: newRoot };
      }

      return;
    }

    const droppedNode = jsonParse<Node>(e.dataTransfer.getData('__artery-node'));
    if (droppedNode) {
      // todo drop action
      const newRoot = dropNode({ root: artery.node, node: droppedNode, hoveringNodeID: greenZone.hoveringNodeID, position: greenZone.position });
      if (newRoot) {
        return { ...artery, node: newRoot };
      }
    }

    return;
  }

  return (
    <div
      draggable={id !== rootNodeID}
      onDragStart={(e) => {
        setDraggingNodeID(id);
        // todo this has no affect, fix it!
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setDraggingNodeID()}
      onDrag={preventDefault}
      onDragOver={(e) => {
        preventDefault(e);
        handleDragOver(e);
        return false;
      }}
      onDragEnter={preventDefault}
      onDrop={(e) => {
        e.stopPropagation();
        e.preventDefault();
        const newArtery = handleDrop(e);
        if (newArtery) {
          onChange(newArtery);
        }

        // reset green zone to undefine to prevent green zone first paine flash
        setGreenZone(undefined);

        return false;
      }}
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
