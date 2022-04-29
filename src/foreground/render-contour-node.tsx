import React, { useCallback, useContext, useRef } from 'react';
import cs from 'classnames';
import { debounce } from 'lodash';
import { Artery, Node } from '@one-for-all/artery';
import { byArbitrary, keyPathById, parentIdsSeq } from '@one-for-all/artery-utils';

import useContourNodeStyle from './use-active-contour-node';
import { calcHoverPosition } from './calc-green-zone';
import { ArteryCtx } from '../contexts';
import { moveNode, dropNode, jsonParse } from './helper';
import { getIsNodeSupportCache } from '../cache';
import type { ContourNode, GreenZone, NodeWithoutChild, Position } from '../types';
import { useRecoilState } from 'recoil';
import { draggingArteryNodeState, greenZoneState, hoveringParentIDState, immutableNodeState } from '../atoms';
import { overrideDragImage } from '../utils';

function preventDefault(e: any): false {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

interface Props {
  contourNode: ContourNode;
}

function shouldHandleDnd(
  currentID: string,
  draggingNodeID: string,
  root: Immutable.Collection<unknown, unknown>,
): boolean {
  const parentIDs = parentIdsSeq(root, currentID);
  if (!parentIDs) {
    return false;
  }

  return parentIDs.keyOf(draggingNodeID) !== undefined ? false : true;
}

function useShouldHandleDndCallback(currentID: string): () => boolean {
  const shouldHandleRef = useRef<boolean | undefined>();
  const [root] = useRecoilState(immutableNodeState);
  const [draggingArteryNode] = useRecoilState(draggingArteryNodeState);

  return useCallback(() => {
    if (!draggingArteryNode) {
      return false;
    }

    if (shouldHandleRef.current === undefined) {
      shouldHandleRef.current = shouldHandleDnd(currentID, draggingArteryNode.id, root);
    }

    return shouldHandleRef.current;
  }, [draggingArteryNode, root]);
}

function RenderContourNode({ contourNode }: Props): JSX.Element {
  const [hoveringParentID] = useRecoilState(hoveringParentIDState);
  const { onChange, rootNodeID, artery, activeNode, setActiveNode } = useContext(ArteryCtx);
  const style = useContourNodeStyle(contourNode);
  // const { setShowIndicator } =
  //   useContext(IndicatorCTX);
  const currentArteryNodeRef = useRef<Node>();
  const [greenZone, setGreenZone] = useRecoilState(greenZoneState);
  const [draggingArteryNode, setDraggingArteryNode] = useRecoilState(draggingArteryNodeState);
  const [immutableNode] = useRecoilState(immutableNodeState);
  const positionRef = useRef<Position>();

  const _shouldHandleDnd = useShouldHandleDndCallback(contourNode.id);

  // todo fix this
  function optimizedSetGreenZone(newZone?: GreenZone): void {
    if (newZone?.hoveringNodeID !== greenZone?.hoveringNodeID || newZone?.position !== greenZone?.position) {
      setGreenZone(newZone);
    }
  }

  const handleDragOver = debounce((e) => {
    if (draggingArteryNode?.id === contourNode.id) {
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
    setDraggingArteryNode(undefined);

    if (!greenZone) {
      return;
    }

    // move action
    if (draggingArteryNode) {
      const newRoot = moveNode({
        root: artery.node,
        draggingNodeID: draggingArteryNode.id,
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
        // todo this has no affect, fix it!
        e.dataTransfer.effectAllowed = 'move';

        const keyPath = keyPathById(immutableNode, contourNode.id);
        if (!keyPath) {
          return;
        }
        // @ts-ignore
        const arteryNode = immutableNode.getIn(keyPath)?.toJS();
        if (!arteryNode) {
          return;
        }
        setDraggingArteryNode(arteryNode);

        overrideDragImage(e.dataTransfer);
      }}
      onDragEnd={() => {
        setDraggingArteryNode(undefined);
        setGreenZone(undefined);
      }}
      onDrag={preventDefault}
      onDragOver={(e) => {
        if (!_shouldHandleDnd()) {
          return;
        }

        preventDefault(e);
        handleDragOver(e);
        return false;
      }}
      onDragEnter={(e) => {
        if (!_shouldHandleDnd()) {
          return;
        }

        const keyPath = keyPathById(immutableNode, contourNode.id);
        if (!keyPath) {
          return;
        }
        // @ts-ignore
        const arteryNode = immutableNode.getIn(keyPath)?.toJS();
        currentArteryNodeRef.current = arteryNode;

        preventDefault(e);

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
        'contour-node--dragging': draggingArteryNode?.id === contourNode.id,
      })}
    />
  );
}

export default RenderContourNode;
