import React, { useContext, useRef } from 'react';
import cs from 'classnames';
import { throttle } from 'lodash';
import { Artery, Node } from '@one-for-all/artery';
import { byArbitrary, findNodeByID } from '@one-for-all/artery-utils';

import useContourNodeStyle from './use-active-contour-node';
import { calcHoverPosition } from './calc-green-zone';
import { ArteryCtx } from '../contexts';
import { moveNode, dropNode, jsonParse } from './helper';
import { getIsNodeSupportCache } from '../cache';
import type { ContourNode, GreenZone, NodeWithoutChild, Position } from '../types';
import { useRecoilState } from 'recoil';
import { draggingNodeIDState, greenZoneState, hoveringParentIDState, immutableNodeState } from '../atoms';

function preventDefault(e: any): false {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

interface Props {
  contourNode: ContourNode;
}

function RenderContourNode({ contourNode }: Props): JSX.Element {
  const [hoveringParentID] = useRecoilState(hoveringParentIDState);
  const { onChange, rootNodeID, artery, activeNode, setActiveNode } = useContext(ArteryCtx);
  const style = useContourNodeStyle(contourNode);
  // const { setShowIndicator } =
  //   useContext(IndicatorCTX);
  const currentArteryNodeRef = useRef<Node>();
  const [greenZone, setGreenZone] = useRecoilState(greenZoneState);
  const [draggingNodeID, setDraggingNodeID] = useRecoilState(draggingNodeIDState);
  const [immutableNode] = useRecoilState(immutableNodeState);
  const positionRef = useRef<Position>();

  // todo fix this
  function optimizedSetGreenZone(newZone?: GreenZone): void {
    if (newZone?.hoveringNodeID !== greenZone?.hoveringNodeID || newZone?.position !== greenZone?.position) {
      setGreenZone(newZone);
    }
  }

  const handleDragOver = throttle((e) => {
    if (draggingNodeID === contourNode.id) {
      return;
    }

    // TODO bug
    // if hovering node is draggingNode's parent
    // dragging node will be move to first
    const position = calcHoverPosition({
      cursorX: e.clientX,
      cursorY: e.clientY,
      hoveringRect: contourNode.raw,
      supportInner: !!getIsNodeSupportCache(currentArteryNodeRef.current as NodeWithoutChild),
    });

    if (positionRef.current !== position) {
      positionRef.current = position;
      optimizedSetGreenZone({ position, hoveringNodeID: contourNode.id, mostInnerNode: contourNode });
    }

    return false;
    // todo optimize this
  }, 200);

  function handleClick(): void {
    const keyPath = byArbitrary(immutableNode, contourNode.id);
    if (!keyPath) {
      return;
    }

    if (immutableNode.hasIn(keyPath)) {
      // @ts-ignore
      setActiveNode(immutableNode.getIn(keyPath).toJS());
    }
  }

  // todo give this function a better name
  function handleDrop(e: React.DragEvent<HTMLElement>): Artery | undefined {
    setDraggingNodeID('');

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
      id={`contour-${contourNode.id}`}
      style={style}
      onClick={handleClick}
      draggable={contourNode.id !== rootNodeID}
      onDragStart={(e) => {
        setDraggingNodeID(contourNode.id);
        // todo this has no affect, fix it!
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => {
        setDraggingNodeID('');
        setGreenZone(undefined);
      }}
      onDrag={preventDefault}
      onDragOver={(e) => {
        preventDefault(e);
        handleDragOver(e);
        return false;
      }}
      onDragEnter={(e) => {
        preventDefault(e);

        currentArteryNodeRef.current = findNodeByID(artery.node, contourNode.id);

        return false;
      }}
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
      className={cs('contour-node', {
        'contour-node--root': rootNodeID === contourNode.id,
        'contour-node--active': activeNode?.id === contourNode.id,
        'contour-node--hover-as-parent': hoveringParentID === contourNode.id,
      })}
    />
  );
}

export default RenderContourNode;
