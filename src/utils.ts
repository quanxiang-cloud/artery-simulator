import { useSetRecoilState } from 'recoil';
import { visibleElementsTickState } from './atoms';
import { Position } from './types';
import { NodeWithoutChild } from './types';

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

interface GetPositionParam {
  cursorX: number;
  cursorY: number;
  hoveringRect: DOMRectReadOnly;
  supportInner: boolean;
}

// TODO optimize this
export function calcHoverPosition({ cursorX, hoveringRect, supportInner }: GetPositionParam): Position {
  const leftDistance = Math.abs(cursorX - hoveringRect.left);
  const rightDistance = Math.abs(cursorX - hoveringRect.right);
  if (!supportInner) {
    return leftDistance < rightDistance ? 'left' : 'right';
  }

  if (leftDistance <= 9) {
    return 'left';
  }

  if (rightDistance <= 9) {
    return 'right';
  }

  const oneThirdWidth = hoveringRect.width / 3;
  if (leftDistance < oneThirdWidth) {
    return 'inner-left';
  }

  if (rightDistance < oneThirdWidth) {
    return 'inner-right';
  }

  return 'inner';
}

const isNodeSupportChildrenCache: Map<string, boolean> = new Map();

export function cacheIsNodeSupportChildren(node: NodeWithoutChild, isSupport: boolean): void {
  if (node.type === 'html-element') {
    isNodeSupportChildrenCache.set(`html_node:${node.name}`, isSupport);
    return;
  }

  if (node.type === 'react-component') {
    isNodeSupportChildrenCache.set(
      `react_component:${node.packageName}:${node.packageVersion}:${node.exportName}`,
      isSupport,
    );
  }
}

export function getIsNodeSupportCache(node: NodeWithoutChild): boolean | undefined {
  if (node.type === 'html-element') {
    return isNodeSupportChildrenCache.get(`html_node:${node.name}`);
  }

  if (node.type === 'react-component') {
    return isNodeSupportChildrenCache.get(
      `react_component:${node.packageName}:${node.packageVersion}:${node.exportName}`,
    );
  }

  return false;
}
