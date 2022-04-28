import React, { useContext } from 'react';
import cs from 'classnames';
import { ArteryCtx } from './contexts';

import { draggingNodeIDState, greenZoneState } from './atoms';
import { useRecoilState } from 'recoil';
import { Rect } from '@one-for-all/elements-radar';

function getStyle(rect?: Rect): React.CSSProperties | undefined {
  if (!rect) {
    return;
  }

  const { height, width, x, y } = rect;
  return {
    // zIndex: depth,
    height: height,
    width: width,
    transform: `translate(${x}px, ${y}px)`,
  };
}

function RenderGreenZone(): JSX.Element | null {
  const [greenZone] = useRecoilState(greenZoneState);
  const [draggingNodeID] = useRecoilState(draggingNodeIDState);
  const { rootNodeID } = useContext(ArteryCtx);

  if (!draggingNodeID || !greenZone) {
    return null;
  }

  const style = getStyle(greenZone.mostInnerNode.absolutePosition);

  return (
    <div
      style={style}
      className={cs('green-zone-indicator', `green-zone-indicator--${greenZone.position}`, {
        'green-zone-indicator--root': rootNodeID === greenZone.hoveringNodeID,
      })}
    />
  );
}

export default RenderGreenZone;
