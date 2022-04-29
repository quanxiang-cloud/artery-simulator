import { Position } from '../types';

// interface Cursor {
//   x: number;
//   y: number;
// }

// function isInside(x: number, y: number, rect: DOMRectReadOnly): boolean {
//   return x > rect.left && x < rect.right && y > rect.top && y < rect.bottom;
// }

// function getMostInner(cursor: Cursor, contourNodes: ContourNode[]): ContourNode | undefined {
//   let mostInner: ContourNode | undefined = undefined;
//   let smallestArea = Infinity;

//   for (const current of contourNodes) {
//     if (!isInside(cursor.x, cursor.y, current.raw)) {
//       continue;
//     }

//     const area = current.area;
//     if (area > smallestArea) {
//       continue;
//     }

//     smallestArea = area;
//     mostInner = current;
//   }

//   return mostInner;
// }

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

// interface CalcGreenZoneParams {
//   cursor: Cursor;
//   contourNodes: ContourNode[];
//   draggingNodeID?: string;
//   supportChildren: boolean;
//   hoveringNodeRect: DOMRectReadOnly;
// }

// function calcGreenZone({
//   cursor,
//   contourNodes,
//   draggingNodeID,
//   supportChildren,
//   hoveringNodeRect,
// }: CalcGreenZoneParams): GreenZone | undefined {
//   // const _contourNodes = contourNodes.filter(({ id, nodePath }) => {
//   //   if (id === draggingNodeID) {
//   //     return false;
//   //   }

//   //   // exclude children node
//   //   if (draggingNodeID && nodePath.includes(draggingNodeID)) {
//   //     return false;
//   //   }

//   //   return true;
//   // });

//   // const mostInner = getMostInner(cursor, _contourNodes);
//   // if (!mostInner) {
//   //   return;
//   // }

//   const position = calcHoverPosition({
//     x: cursor.x,
//     y: cursor.y,
//     rect: hoveringNodeRect,
//     supportInner: supportChildren,
//   });

//   return { position };
// }

// export default calcGreenZone;
