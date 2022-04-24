import React, { useMemo } from 'react';
import { ShadowNode } from '../../types';

export default function useToolbarStyle(node?: ShadowNode): React.CSSProperties | undefined {
  const { absolutePosition, relativeRect } = node || {};

  return useMemo(() => {
    if (!node || !absolutePosition || !relativeRect) {
      return;
    }

    const { x, y, height } = absolutePosition;

    if (relativeRect?.y < 40) {
      return {
        transform: `translate(${x + 4}px, ${y + height}px)`,
      };
    }

    return {
      transform: `translate(${x + 4}px, ${y}px)`,
    };
  }, [absolutePosition, relativeRect]);
}
