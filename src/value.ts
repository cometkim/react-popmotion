import { useState } from 'react';
import type { Callable, OverrideProps } from '@cometjs/core';
import { Value, ValueReaction, ValueMap } from 'popmotion/lib/reactions/value';
import { value } from 'popmotion';
import { ValueList } from 'popmotion/lib/animations/keyframes/types';

export function useValueReaction<T extends Value>(init: T | (() => T), subscribe?: Callable) {
  const [reaction, /* stable instance, never update */] = useState(() => {
    const initialValue = typeof init === 'function' ? init() : init;
    return value(initialValue, subscribe);
  });
  return reaction as unknown as ExactValueReaction<T>;
}

export function useValue<T extends Value>(init: T | (() => T)) {
  const [syncedValue, updateValue] = useState(init);
  const reaction = useValueReaction(init, updateValue);
  return [syncedValue, reaction as unknown as ExactValueReaction<T>] as const;
}

type VelocityOfValue<V extends Value> = (
    V extends (string | number) ? number
  : V extends ValueMap ? { [key: string]: number }
  : V extends ValueList ? number[]
  : never
);
type ExactValueReaction<V extends Value> = OverrideProps<ValueReaction, {
  get: () => V,
  update: (value: V) => void,
  getVelocity(): () => VelocityOfValue<V>,
}>;
