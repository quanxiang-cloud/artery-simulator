import { GreenZone, ContourNode, Position } from '../types';

interface Cursor {
  x: number;
  y: number;
}

function isInside(x: number, y: number, rect: DOMRectReadOnly): boolean {
  return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
}

function getMostInner(cursor: Cursor, contourNodes: ContourNode[]): ContourNode | undefined {
  let mostInner: ContourNode | undefined = undefined;
  let smallestArea = Infinity;

  for (const current of contourNodes) {
    if (!isInside(cursor.x, cursor.y, current.raw)) {
      continue;
    }

    const area = current.area;
    if (area > smallestArea) {
      continue;
    }

    smallestArea = area;
    mostInner = current;
  }

  return mostInner;
}

interface GetPositionParam {
  x: number;
  y: number;
  rect: DOMRectReadOnly;
  supportInner: boolean;
}

// TODO optimize this
function getPosition({ x, rect, supportInner }: GetPositionParam): Position {
  const leftDistance = Math.abs(x - rect.left);
  const rightDistance = Math.abs(x - rect.right);

  if (!supportInner) {
    return leftDistance < rightDistance ? 'left' : 'right';
  }

  const oneThirdWidth = rect.width / 3;
  if (leftDistance < oneThirdWidth) {
    return 'inner-left';
  }

  if (rightDistance < oneThirdWidth) {
    return 'inner-right';
  }

  return 'inner';
}

function calcGreenZone(
  cursor: Cursor,
  contourNodes: ContourNode[],
  draggingNodeID?: string,
): GreenZone | undefined {
  const _contourNodes = contourNodes.filter(({ id, nodePath }) => {
    if (id === draggingNodeID) {
      return false;
    }

    // exclude children node
    if (draggingNodeID && nodePath.includes(draggingNodeID)) {
      return false;
    }

    return true;
  });

  const mostInner = getMostInner(cursor, _contourNodes);
  if (!mostInner) {
    return;
  }

  const position = getPosition({
    x: cursor.x,
    y: cursor.y,
    rect: mostInner.raw,
    supportInner: mostInner.supportChildren,
  });

  return { position, hoveringNodeID: mostInner.id, mostInnerNode: mostInner };
}

export default calcGreenZone;
