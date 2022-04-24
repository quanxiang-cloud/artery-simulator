import React from 'react';
import { Artery, Node } from '@one-for-all/artery';
import { EmptyChildPlaceholder, GreenZone, NodeWithoutChild } from './types';

interface ArteryContext {
  artery: Artery;
  rootNodeID: string;
  activeNode?: Node;
}

export const ArteryCtx = React.createContext<ArteryContext>({
  // TODO fixme
  // @ts-ignore
  artery: { node: { type: 'html-element', name: 'div' } },
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
}

export const ActionsCtx = React.createContext<ActionsContext>({
  onChange: () => {},
});
