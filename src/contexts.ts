import React from 'react';
import { Artery, Node } from '@one-for-all/artery';
import { EmptyChildPlaceholder, GreenZone, NodeWithoutChild } from './types';

interface ArteryContext {
  artery: Artery;
  rootNodeID: string;
  activeNode?: Node;
  setActiveNode: (node: Node) => void;
}

export const ArteryCtx = React.createContext<ArteryContext>({
  // TODO fixme
  // @ts-ignore
  artery: { node: { type: 'html-element', name: 'div' } },
  setActiveNode: () => {},
  rootNodeID: '',
});

interface IndicatorContext {
  draggingNodeID?: string;
  setDraggingNodeID: (nodeID?: string) => void;
  greenZone?: GreenZone;
  setGreenZone: (greenZone?: GreenZone) => void;
  setShowIndicator: (isShow: boolean) => void;
  // showIndicator: boolean;
}

export const IndicatorCTX = React.createContext<IndicatorContext>({
  setDraggingNodeID: () => {},
  setGreenZone: () => {},
  setShowIndicator: () => {},
});

interface ActionsContext {
  emptyChildrenPlaceholder?: EmptyChildPlaceholder;
  isNodeSupportChildren?: (node: NodeWithoutChild) => Promise<boolean>;
  onDropFile?: (file: File) => Promise<string>;
  onChange: (artery: Artery) => void;
  genNodeID: () => string;
}

export const ActionsCtx = React.createContext<ActionsContext>({
  onChange: () => {},
  genNodeID: () => 'gen_node_id_method_default_value_and_do_not_use_this',
});
