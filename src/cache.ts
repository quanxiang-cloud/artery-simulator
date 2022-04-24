import { NodeWithoutChild } from "./types";

const isNodeSupportChildrenCache: Map<string, boolean> = new Map();

export function cacheIsNodeSupportChildren(node: NodeWithoutChild, isSupport: boolean): void {
  if (node.type === 'html-element') {
    isNodeSupportChildrenCache.set(`html_node:${node.name}`, isSupport);
    return;
  }

  if (node.type === 'react-component') {
    isNodeSupportChildrenCache.set(`react_component:${node.packageName}:${node.packageVersion}:${node.exportName}`, isSupport);
  }
}

export function getIsNodeSupportCache(node: NodeWithoutChild): boolean {
  if (node.type === 'html-element') {
    return !!isNodeSupportChildrenCache.get(`html_node:${node.name}`);
  }

  if (node.type === 'react-component') {
    return !!isNodeSupportChildrenCache.get(`react_component:${node.packageName}:${node.packageVersion}:${node.exportName}`);
  }

  return false;
}
