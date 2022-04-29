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

const img = new Image();
img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

export function overrideDragImage(dateTransfer: DataTransfer): void {
  dateTransfer.setDragImage(img, 0, 0);
}
