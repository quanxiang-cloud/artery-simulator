import { useRecoilState, useSetRecoilState } from 'recoil';
import React, { useEffect, useRef } from 'react';

import RenderContourNode from './render-contour-node';
import { contourNodesState, greenZoneState, isScrollingState } from '../atoms';

import type { ContourNode, GreenZone, Position, SimulatorReport } from '../types';

import './index.scss';
import { useContourNodes } from './use-contour-nodes';
import { throttle } from 'lodash';
import { calcHoverPosition, getIsNodeSupportCache } from '../utils';

interface Props {
  report: SimulatorReport;
}

function Foreground({ report }: Props): JSX.Element {
  const [isScrolling] = useRecoilState(isScrollingState);
  const contourNodes = useContourNodes(report.visibleNodes, isScrolling);
  const setContourNodesState = useSetRecoilState(contourNodesState);
  const positionRef = useRef<Position>();
  const [greenZone, setGreenZone] = useRecoilState(greenZoneState);

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
          />
        );
      })}
    </div>
  );
}

export default Foreground;
