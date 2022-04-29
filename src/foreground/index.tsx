import { useRecoilState, useSetRecoilState } from 'recoil';
import React, { useContext, useEffect, useRef } from 'react';
import type { Node } from '@one-for-all/artery';

import RenderContourNode from './render-contour-node';
import { contourNodesState, draggingArteryNodeState, greenZoneState, isScrollingState } from '../atoms';
import type { ContourNode, GreenZone, Position, SimulatorReport } from '../types';
import { useContourNodes } from './use-contour-nodes';
import { throttle } from 'lodash';
import { calcHoverPosition } from '../utils';
import { dropNode, jsonParse, moveNode } from './helper';
import { ArteryCtx } from '../contexts';
import './index.scss';

interface Props {
  report: SimulatorReport;
}

function Foreground({ report }: Props): JSX.Element {
  const [isScrolling] = useRecoilState(isScrollingState);
  const { onChange, artery } = useContext(ArteryCtx);
  const contourNodes = useContourNodes(report.visibleNodes, isScrolling);
  const setContourNodesState = useSetRecoilState(contourNodesState);
  const positionRef = useRef<Position>();
  const [greenZone, setGreenZone] = useRecoilState(greenZoneState);
  const [draggingArteryNode, setDraggingArteryNode] = useRecoilState(draggingArteryNodeState);

  function optimizedSetGreenZone(newZone?: GreenZone): void {
    if (newZone?.hoveringNodeID !== greenZone?.hoveringNodeID || newZone?.position !== greenZone?.position) {
      setGreenZone(newZone);
    }
  }

  const handleDragOver = throttle((e: React.DragEvent<HTMLDivElement>, hoveringContourNode: ContourNode) => {
    const position = calcHoverPosition({
      cursorX: e.clientX,
      cursorY: e.clientY,
      hoveringRect: hoveringContourNode.raw,
      // supportInner: !!getIsNodeSupportCache(currentArteryNodeRef.current as NodeWithoutChild),
      supportInner: false,
    });

    if (positionRef.current !== position) {
      positionRef.current = position;
      optimizedSetGreenZone({ position, hoveringNodeID: hoveringContourNode.id, mostInnerNode: hoveringContourNode });
    }
  }, 200);

  // todo give this function a better name
  function handleDrop(e: React.DragEvent<HTMLElement>): void {
    setDraggingArteryNode(undefined);

    if (!greenZone) {
      return;
    }

    let newRoot: Node | undefined;

    // move action
    if (draggingArteryNode) {
      newRoot = moveNode({
        root: artery.node,
        draggingNodeID: draggingArteryNode.id,
        hoveringNodeID: greenZone.hoveringNodeID,
        position: greenZone.position,
      });
    } else {
      const droppedNode = jsonParse<Node>(e.dataTransfer.getData('__artery-node'));
      if (droppedNode) {
        // todo drop action
        newRoot = dropNode({
          root: artery.node,
          node: droppedNode,
          hoveringNodeID: greenZone.hoveringNodeID,
          position: greenZone.position,
        });
      }
    }

    if (newRoot) {
      onChange({ ...artery, node: newRoot });
    }

    setGreenZone(undefined);
  }

  useEffect(() => {
    setContourNodesState(contourNodes);
  }, [contourNodes]);

  return (
    <div className="contour-nodes">
      {contourNodes.map((contour) => {
        return (
          <RenderContourNode
            key={`contour-${contour.id}`}
            contourNode={contour}
            handleDragOver={(e) => handleDragOver(e, contour)}
            handleDrop={handleDrop}
          />
        );
      })}
    </div>
  );
}

export default Foreground;
