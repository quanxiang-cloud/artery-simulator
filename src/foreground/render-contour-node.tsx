import React, { useContext } from 'react';
import { throttle } from 'lodash';
import cs from 'classnames';
import { Artery, Node } from '@one-for-all/artery';

import { ContourNode } from '../types';
import { ActionsCtx, ArteryCtx, IndicatorCTX } from '../contexts';
import calcGreenZone from './calc-green-zone';
import { ContourNodesContext } from './contexts';
import useContourNodeStyle from './use-active-contour-node';
import { moveNode, dropNode, jsonParse } from './helper';
import ContourNodeToolbar from './toolbar';
import { findNodeByID } from '@one-for-all/artery-utils';

function preventDefault(e: any): false {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

interface Props {
  contourNode: ContourNode;
  className?: string;
}

function RenderContourNode({ contourNode, className }: Props): JSX.Element {
  const { id } = contourNode;
  const { rootNodeID, artery, activeNode, setActiveNode } = useContext(ArteryCtx);
  const { onChange } = useContext(ActionsCtx);
  const style = useContourNodeStyle(contourNode);
  const contourNodes = useContext(ContourNodesContext);
  const { setGreenZone, greenZone, setShowIndicator, setDraggingNodeID, draggingNodeID } =
    useContext(IndicatorCTX);

  const handleDragOver = throttle((e) => {
    setShowIndicator(true);

    const greenZone = calcGreenZone({ x: e.clientX, y: e.clientY }, contourNodes, draggingNodeID);
    setGreenZone(greenZone);

    return false;
  });

  function handleClick() {
    const arteryNode = findNodeByID(artery.node, id);
    if (arteryNode) {
      setActiveNode(arteryNode);
    }
  }

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
        return { ...artery, node: newRoot };
      }

      return;
    }

    const droppedNode = jsonParse<Node>(e.dataTransfer.getData('__artery-node'));
    if (droppedNode) {
      // todo drop action
      const newRoot = dropNode({
        root: artery.node,
        node: droppedNode,
        hoveringNodeID: greenZone.hoveringNodeID,
        position: greenZone.position,
      });
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
      onClick={handleClick}
      className={cs('contour-node', className, {
        'contour-node--root': rootNodeID === id,
        'contour-node--active': activeNode?.id === id,
      })}
    >
      {/* <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <span>{id}</span>
      </div> */}
    </div>
  );
}

export default RenderContourNode;
