import { useMemo, useState, useEffect } from 'react';
import shallowEqual from 'fbjs/lib/shallowEqual';

import type {
  tween,
  spring,
  physics,
  keyframes,
  decay,
  everyFrame,
  pointer,
  multitouch,
} from 'popmotion';

export type SupportedAction = (
  | typeof tween
  | typeof spring
  | typeof keyframes
  | typeof physics
  | typeof decay
  | typeof everyFrame
  | typeof pointer
  | typeof multitouch
);

export function useAction<A extends SupportedAction>(
  action: A,
  actionProps?: Parameters<A>[0]
) {
  const [memoizedProps, updateProps] = useState(actionProps);
  useEffect(() => {
    if (!shallowEqual(actionProps, memoizedProps)) {
      updateProps(actionProps);
    }
  }, [actionProps, memoizedProps]);

  return useMemo(() => action(memoizedProps ?? {} as any), [action, memoizedProps]);
}
