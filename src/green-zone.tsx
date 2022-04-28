import React, { useContext, useMemo } from 'react';
import cs from 'classnames';
import { ArteryCtx } from './contexts';

import { GreenZone, ContourNode } from './types';

interface Props {
  greenZone: GreenZone;
}

function useContourNodeStyle({ depth, absolutePosition }: ContourNode): React.CSSProperties {
  const { height, width, x, y } = absolutePosition;

  return useMemo(() => {
    return {
      // zIndex: depth,
      height: height,
      width: width,
      transform: `translate(${x}px, ${y}px)`,
    };
  }, [height, width, x, y, depth]);
}

function RenderGreenZone({ greenZone }: Props): JSX.Element {
  const style = useContourNodeStyle(greenZone.mostInnerNode);
  const { rootNodeID } = useContext(ArteryCtx);

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
