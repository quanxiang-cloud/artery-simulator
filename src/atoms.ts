import immutable from 'immutable';
import {
  atom,
} from 'recoil';
import { ContourNode, GreenZone } from './types';

export const immutableNodeState = atom<Immutable.Collection<unknown, unknown>>({
  key: 'immutableNodeState',
  // eslint-disable-next-line new-cap
  default: immutable.Map({}),
});

export const greenZoneState = atom<GreenZone | undefined>({ key: 'greenZoneState', default: undefined });

export const draggingNodeIDState = atom<string>({ key: 'draggingNodeIDState', default: '' });

export const isDraggingOverState = atom<boolean>({ key: 'isDraggingOverState', default: false });

export const scrollPositionState = atom({ key: 'scrollPositionState', default: { x: 0, y: 0 } });

export const activeContourNodeState = atom<ContourNode | undefined>({
  key: 'activeContourNodeState',
  default: undefined,
});

export const contourNodesState = atom<ContourNode[]>({ key: 'contourNodesState', default: [] });

export const hoveringParentIDState = atom<string>({ key: 'hoveringParentIDState', default: '' });