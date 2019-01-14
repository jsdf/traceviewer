// @flow

export default function memoizeWeak<TArg, TRet>(
  fn: (arg: TArg) => TRet
): (arg: TArg) => TRet {
  const cache = new WeakMap();
  return (arg: TArg) => {
    if (!cache.has(arg)) {
      cache.set(arg, fn(arg));
    }
    return cache.get(arg) || fn(arg);
  };
}
