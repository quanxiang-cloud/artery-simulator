import React from 'react';
import { RecoilRoot } from 'recoil';

import Simulator, { Props } from './simulator';

export default (props: Props): JSX.Element => {
  return (
    <RecoilRoot>
      <Simulator {...props} />
    </RecoilRoot>
  );
};
