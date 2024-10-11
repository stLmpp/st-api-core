export interface ThrottleOptions {
  ttl?: number;
  limit?: number;
}

const ThrottleMetadataSymbol = Symbol('ThrottleMetadata');

interface Throttle {
  (options?: ThrottleOptions): ClassDecorator;
  getMetadata(target: any): ThrottleOptions | undefined;
  setMetadata(target: any, options?: ThrottleOptions): void;
}

const getMetadata: Throttle['getMetadata'] = (target) =>
  Reflect.getMetadata(ThrottleMetadataSymbol, target);
const setMetadata: Throttle['setMetadata'] = (target, options) => {
  Reflect.defineMetadata(ThrottleMetadataSymbol, options ?? {}, target);
};

function Decorator(options?: ThrottleOptions): ClassDecorator {
  return (target) => {
    setMetadata(target, options);
  };
}

export const Throttle: Throttle = Object.assign(Decorator, {
  getMetadata,
  setMetadata,
});
