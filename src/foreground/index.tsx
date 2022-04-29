import { useRecoilState, useSetRecoilState } from 'recoil';
import React, { useEffect } from 'react';

import RenderContourNode from './render-contour-node';
import Toolbar from './toolbar';
import { contourNodesState, isScrollingState } from '../atoms';

import type { SimulatorReport } from '../types';

import './index.scss';
import { useContourNodes } from './use-contour-nodes';

interface Props {
  report: SimulatorReport;
}

function Foreground({ report }: Props): JSX.Element {
  const [isScrolling] = useRecoilState(isScrollingState);
  const contourNodes = useContourNodes(report.visibleNodes, isScrolling);

  const setContourNodesState = useSetRecoilState(contourNodesState);
  useEffect(() => {
    setContourNodesState(contourNodes);
  }, [contourNodes]);

  return (
    <>
      <div className="contour-nodes">
        {contourNodes.map((contour) => {
          return (
            <RenderContourNode
              key={`contour-${contour.id}`}
              contourNode={contour}
            />
          );
        })}
      </div>
      <Toolbar />
    </>
  );
}

export default Foreground;
