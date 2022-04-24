import { useState, useRef, useEffect, useContext } from 'react';
import ElementsRadar from '@one-for-all/elements-radar';
import { SimulatorReport, VisibleNode } from '../types';
import { AllElementsCTX } from './contexts';

function useObserverCallback(
  setVisibleNodes: (elements: HTMLElement[]) => void,
): IntersectionObserverCallback {
  const allElements = useContext(AllElementsCTX);

  return (entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (allElements.has(target as HTMLElement)) {
        allElements.set(target as HTMLElement, isIntersecting);
      }
    });

    setVisibleNodes(
      Array.from(allElements.entries())
        .filter(([_, isVisible]) => isVisible)
        .map(([ele]) => ele),
    );
  };
}

function useRadarRef(
  onReport: (report: SimulatorReport) => void,
  root: HTMLElement | null,
): React.MutableRefObject<ElementsRadar | undefined> {
  const radarRef = useRef<ElementsRadar>();
  useEffect(() => {
    if (!root) {
      return;
    }

    const radar = new ElementsRadar(root);
    radarRef.current = radar;
    const subscription = radar.listen((report) => {
      // TODO: batch read this for preventing reflow
      const deltaX = root.scrollLeft || 0;
      const deltaY = root.scrollTop || 0;
      const scrollHeight = root.scrollHeight || 0;
      const scrollWidth = root.scrollWidth || 0;
      const visibleNodes: VisibleNode[] = Array.from(report.entries()).map(([element, { relativeRect, raw }]) => {
        return {
          // @ts-ignore
          id: element.dataset.simulatorNodeId as string,
          raw,
          relativeRect,
          absolutePosition: {
            ...relativeRect,
            x: Math.round(relativeRect.x + deltaX),
            y: Math.round(relativeRect.y + deltaY),
          },
        };
      });

      onReport({ visibleNodes, areaHeight: scrollHeight, areaWidth: scrollWidth });
    });

    return () => {
      radar.unListen(subscription);
    };
  }, [root]);

  return radarRef;
}

function useVisibleObserver(
  onReport: (report: SimulatorReport) => void,
  root: HTMLElement | null,
): IntersectionObserver {
  const [latestVisibleElements, setLatesVisibleElements] = useState<HTMLElement[]>([]);
  const radarRef = useRadarRef(onReport, root);
  const visibleObserverRef = useRef<IntersectionObserver>(
    new IntersectionObserver(useObserverCallback(setLatesVisibleElements)),
  );

  useEffect(() => {
    radarRef.current?.track(latestVisibleElements);
  }, [latestVisibleElements]);

  return visibleObserverRef.current;
}

export default useVisibleObserver;
