/**
 * Type declarations for lodash/debounce
 */

declare module 'lodash/debounce' {
  interface DebouncedFunc<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
  }

  interface DebounceSettings {
    leading?: boolean;
    maxWait?: number;
    trailing?: boolean;
  }

  function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number,
    options?: DebounceSettings,
  ): DebouncedFunc<T>;

  export default debounce;
}
