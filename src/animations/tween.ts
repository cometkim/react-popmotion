import { tween, TweenProps } from 'popmotion';
import { Value } from 'popmotion/lib/reactions/value';
import { OverrideProps } from '@cometjs/core';

import { useAutoplayValue } from '../utils/autoplay';

type UseTweenValueProps<V extends Value> = OverrideProps<TweenProps, {
  from: V,
  to: V,
  playing?: boolean,
}>;
export function useTweenValue<V extends Value>(
  props: UseTweenValueProps<V>,
) {
  return useAutoplayValue({
    init: props.from,
    action: tween,
    actionProps: props,
    playing: props.playing,
  });
}
