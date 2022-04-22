import { HTMLNode, ReactComponentNode } from '@one-for-all/artery';
import type { Rect, ElementRect } from '@one-for-all/elements-radar';
import { ComponentClass, FunctionComponent } from 'react';

export interface VisibleNode extends ElementRect {
  id: string;
  absolutePosition: Rect;
}

export interface SimulatorReport {
  visibleNodes: VisibleNode[];
  areaHeight: number;
  areaWidth: number;
}

export interface ShadowNode extends VisibleNode {
  nodePath: string[];
  depth: number;
  supportChildren: boolean;
  area: number;
}

export type Position =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'inner'
  | 'inner-top'
  | 'inner-right'
  | 'inner-bottom'
  | 'inner-left';

export interface GreenZone {
  hoveringNodeID: string;
  position: Position;
  mostInnerNode: ShadowNode;
}

export type NodeWithoutChild =
  | Pick<HTMLNode, 'type' | 'name'>
  | Pick<ReactComponentNode, 'type' | 'packageName' | 'packageVersion' | 'exportName'>;

export type EmptyChildPlaceholder = FunctionComponent<any> | ComponentClass<any, any>;
