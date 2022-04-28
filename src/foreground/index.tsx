import React from 'react';

import ContourNodes from './contour-nodes';
import type { SimulatorReport } from '../types';

import './index.scss';

interface Props {
  report: SimulatorReport;
}

function Foreground({ report }: Props): JSX.Element {
  return (
    <ContourNodes nodes={report.visibleNodes} />
  );
}

export default Foreground;
