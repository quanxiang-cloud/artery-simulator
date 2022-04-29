import React, { useCallback, useContext, useRef } from 'react';
import cs from 'classnames';
import { Artery, Node } from '@one-for-all/artery';
import { byArbitrary, keyPathById, parentIdsSeq } from '@one-for-all/artery-utils';

import useContourNodeStyle from './use-active-contour-node-style';
import { ArteryCtx } from '../contexts';
import { moveNode, dropNode, jsonParse } from './helper';
import type { ContourNode } from '../types';
import { useRecoilState } from 'recoil';
import { draggingArteryNodeState, greenZoneState, hoveringParentIDState, immutableNodeState } from '../atoms';
import { overrideDragImage } from '../utils';
import Toolbar from './toolbar';

function preventDefault(e: any): false {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

interface Props {
  contourNode: ContourNode;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
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

function RenderContourNode({ contourNode, handleDragOver }: Props): JSX.Element {
  const [hoveringParentID] = useRecoilState(hoveringParentIDState);
  const { onChange, rootNodeID, artery, activeNode, setActiveNode } = useContext(ArteryCtx);
  const style = useContourNodeStyle(contourNode);
  const [greenZone, setGreenZone] = useRecoilState(greenZoneState);
  const [draggingArteryNode, setDraggingArteryNode] = useRecoilState(draggingArteryNodeState);
  const [immutableNode] = useRecoilState(immutableNodeState);

  const _shouldHandleDnd = useShouldHandleDndCallback(contourNode.id);
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
    <>
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
      {activeNode?.id === contourNode.id && (
        <Toolbar contourNode={contourNode} />
      )}
    </>
  );
}

export default RenderContourNode;
