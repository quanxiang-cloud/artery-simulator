import { HTMLNode, ReactComponentNode } from '@one-for-all/artery';

export function isSupportChildren(node: HTMLNode | ReactComponentNode): Promise<boolean> {
  console.log(node);
  return Promise.resolve(true);
}
