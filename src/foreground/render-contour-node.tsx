import React, { useCallback, useContext, useMemo, useRef } from 'react';
import cs from 'classnames';
import { Node } from '@one-for-all/artery';
import { byArbitrary, parentIdsSeq } from '@one-for-all/artery-utils';

import useContourNodeStyle from './use-active-contour-node-style';
import { ArteryCtx } from '../contexts';
import type { ContourNode } from '../types';
import { useRecoilState, useSetRecoilState } from 'recoil';
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
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
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

function RenderContourNode({ contourNode, handleDragOver, handleDrop }: Props): JSX.Element {
  const [hoveringParentID] = useRecoilState(hoveringParentIDState);
  const { onChange, rootNodeID, artery, activeNode, setActiveNode } = useContext(ArteryCtx);
  const style = useContourNodeStyle(contourNode);
  const setGreenZone = useSetRecoilState(greenZoneState);
  const [draggingArteryNode, setDraggingArteryNode] = useRecoilState(draggingArteryNodeState);
  const [immutableNode] = useRecoilState(immutableNodeState);
  const currentArteryNode: Node | undefined = useMemo(() => {
    const keyPath = byArbitrary(immutableNode, contourNode.id);
    if (!keyPath) {
      return;
    }
    // @ts-ignore
    return immutableNode.getIn(keyPath)?.toJS();
  }, [immutableNode]);

  const _shouldHandleDnd = useShouldHandleDndCallback(contourNode.id);
  function handleClick(): void {
    setActiveNode(currentArteryNode);
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
          setDraggingArteryNode(currentArteryNode);

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
          handleDrop(e);
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
