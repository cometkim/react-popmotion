import { useEffect, useMemo } from 'react';
import type { Value } from 'popmotion/lib/reactions/value';
import type { OverrideProps, Callable } from '@cometjs/core';

import { useValue, useValueReaction } from '../value';
import type { SupportedAction } from '../action';
import { useAction } from '../action';

export function useAutoplayValue<V extends Value, A extends SupportedAction>({
  init,
  action,
  actionProps,
  playing = true,
}: {
  init: V | (() => V),
  action: A,
  actionProps: ReplaceValueType<Parameters<A>[0], V>,
  playing?: boolean,
}) {
  const [value, value$] = useValue(init);
  const actionInstance = useAction(action, actionProps);
  useEffect(() => {
    const sub = actionInstance.start(value$);
    if (!playing) {
      sub.stop();
    }
    return () => sub.stop();
  }, [actionInstance, playing, value$]);

  return [value, value$] as const;
}

export function useAutoplaySubscription<V extends Value, A extends SupportedAction>({
  init,
  action,
  actionProps,
  playing = true,
}: {
  init: V | (() => V),
  action: A,
  actionProps: ReplaceValueType<Parameters<A>[0], V>,
  playing?: boolean,
}) {
  const value$ = useValueReaction(init);
  const actionInstance = useAction(action, actionProps);
  useEffect(() => {
    const sub = actionInstance.start(value$);
    if (!playing) {
      sub.stop();
    }
    return () => sub.stop();
  }, [actionInstance, playing, value$]);

  return useMemo(() => ({
    getCurrentValue: () => value$.get(),
    subscribe: (callback: Callable) => {
      const sub = value$.subscribe(callback)
      return () => sub.unsubscribe();
    },
  }), [value$]);
}

type ReplaceValueType<T, V extends Value> = (
  T extends { from?: Value, to?: Value }
  ? OverrideProps<T, { from?: V, to?: V }>
  : T extends { to?: Value }
  ? OverrideProps<T, { to?: V }>
  : T
);
