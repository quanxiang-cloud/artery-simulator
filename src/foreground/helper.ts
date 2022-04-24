import { Node } from '@one-for-all/artery';
import { deleteByID, findNodeByID, insertAfter, insertBefore, appendChild, insertAt } from '@one-for-all/artery-utils';
import { logger } from '@one-for-all/utils';
import { Position } from '../types';

export function moveNode(
  root: Node,
  nodeID: string,
  targetID: string,
  position: Position
): Node | undefined {
  let _root: Node | undefined = root;
  const nodeToMove = findNodeByID(root, nodeID);
  if (!nodeToMove) {
    logger.error(`can not find source node: ${nodeID}, the move operation will be skipped`);
    return root
  }

  _root = deleteByID(root, nodeToMove.id);
  if (position === 'right' || position === 'bottom') {
    return insertAfter(_root, targetID, nodeToMove);
  }

  if (position === 'left' || position === 'top') {
    return insertBefore(_root, targetID, nodeToMove)
  }

  if (position === 'inner-right' || position === 'inner-bottom') {
    return appendChild(_root, targetID, nodeToMove);
  }

  if (position === 'inner-left' || position === 'inner-top' || position === 'inner') {
    return insertAt(_root, targetID, 0, nodeToMove);
  }

  console.error('unimplemented move position:', position);

  return root;
}
