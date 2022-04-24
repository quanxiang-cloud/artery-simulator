import React, { useContext, useMemo } from 'react';
import cs from 'classnames';
import { ArteryCtx } from './contexts';

import { GreenZone, ShadowNode } from './types';

interface Props {
  greenZone: GreenZone;
}

function useShadowNodeStyle({ depth, relativeRect }: ShadowNode): React.CSSProperties {
  const { height, width, x, y } = relativeRect;
  return useMemo(() => {
    return {
      zIndex: depth,
      height: height,
      width: width,
      transform: `translate(${x}px, ${y}px)`,
    };
  }, [height, width, x, y, depth]);
}

function RenderGreenZone({ greenZone }: Props): JSX.Element {
  const style = useShadowNodeStyle(greenZone.mostInnerNode);
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
