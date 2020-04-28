import { useCallback, useEffect, useRef } from 'react';
import type { PhysicsProps } from 'popmotion';
import { physics } from 'popmotion';
import type { OverrideProps } from '@cometjs/core';

import { useValue } from '../value';
import { useAction } from '../action';

type UseJumpProps = OverrideProps<PhysicsProps, {
  groundY?: number,
  onJumpStart?: () => void,
  onJumpEnd?: () => void,
}>;
export function useJump({
  groundY = 0,
  onJumpStart,
  onJumpEnd,
  ...props
}: UseJumpProps) {
  const [y, y$] = useValue(0 as number);
  const physicsAction = useAction(physics, props);

  const { acceleration = 0 } = props;
  const direction = acceleration >= 0 ? 'up' : 'down';
  const bound = direction === 'up' ? Math.max : Math.min;

  type GravitySubscription = {
    set: (y: number) => GravitySubscription,
    setAcceleration: (acceleration: number) => GravitySubscription,
    setFriction: (friction: number) => GravitySubscription,
    setSpringStrength: (strength: number) => GravitySubscription,
    setSpringTarget: (to: number) => GravitySubscription,
    setVelocity: (velocity: number) => GravitySubscription,
    stop: () => GravitySubscription,
  };
  const gravityRef = useRef<GravitySubscription>();
  useEffect(function onUnmount() {
    return () => {
      gravityRef.current?.stop()
    };
  }, []);

  type JumpProps = {
    start: number,
    velocity: number,
  };

  const jump = useCallback(
    function jumpStart(props: JumpProps) {
      gravityRef.current?.stop();
      gravityRef.current = (
        (physicsAction.start(y$) as GravitySubscription)
        .set(props.start)
        .setVelocity(props.velocity)
      );
      onJumpStart?.();
    },
    [physicsAction, y$, onJumpStart],
  );

  useEffect(
    function jumpEnd() {
      if (!gravityRef.current) {
        return;
      }
      if (
        (direction === 'up' && y <= groundY) ||
        (direction === 'down' && y >= groundY)
      ) {
        y$.update(groundY);
        gravityRef.current.stop();
        gravityRef.current = undefined;
        onJumpEnd?.();
      }
    },
    [y, y$, groundY, onJumpEnd],
  );

  return [bound(y, groundY), jump] as const;
};
