import type { HTMLNode, ReactComponentNode } from '@one-for-all/artery-renderer';
import React, { useContext, useEffect, useState } from 'react';
import { ActionsCtx } from '../../contexts';
import { NodeWithoutChild } from '../../types';

interface Props {
  parent: HTMLNode | ReactComponentNode;
}

function getParentNode(parent: HTMLNode | ReactComponentNode): NodeWithoutChild {
  if (parent.type === 'html-element') {
    return { type: 'html-element', name: parent.name };
  }

  return {
    type: 'react-component',
    packageName: parent.packageName,
    packageVersion: parent.packageVersion,
    exportName: parent.exportName,
  };
}

function Placeholder({ parent }: Props): JSX.Element | null {
  const { emptyChildrenPlaceholder, isNodeSupportChildren } = useContext(ActionsCtx);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let unMounting = false;

    if (!isNodeSupportChildren) {
      return;
    }

    isNodeSupportChildren(getParentNode(parent))
      .then((flag) => {
        if (!unMounting) {
          setShouldRender(flag);
        }
      })
      .catch(() => {});

    return () => {
      unMounting = true;
    };
  }, []);

  if (!emptyChildrenPlaceholder || !shouldRender) {
    return null;
  }

  return React.createElement(
    'div',
    { className: 'placeholder-for-empty-children' },
    React.createElement(emptyChildrenPlaceholder),
  );
}

export default Placeholder;
