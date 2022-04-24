import React from 'react';

/* tslint:disable:no-empty */
function noop() {}

export const AllElementsCTX = React.createContext<Map<HTMLElement, boolean>>(new Map());
export const VisibleObserverCTX = React.createContext<IntersectionObserver>(new IntersectionObserver(noop));
