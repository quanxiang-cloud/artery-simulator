import { useSetRecoilState } from 'recoil';
import { visibleElementsTickState } from './atoms';

let n = 0;

export function useNextTick(): () => void {
  const next = useSetRecoilState(visibleElementsTickState);

  return () => {
    n = n + 1;
    next(n);
  };
}
