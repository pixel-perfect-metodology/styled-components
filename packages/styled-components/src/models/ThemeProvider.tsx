import React, { useContext, useMemo } from 'react';
import styledError from '../utils/error';
import isFunction from '../utils/isFunction';

export interface DefaultTheme {
  [key: string]: any;
}

type ThemeFn = (outerTheme?: DefaultTheme) => DefaultTheme;
type ThemeArgument = DefaultTheme | ThemeFn;

type Props = {
  children?: React.ReactChild;
  theme: ThemeArgument;
};

export const ThemeContext = React.createContext<DefaultTheme | undefined>(undefined);

export const ThemeConsumer = ThemeContext.Consumer;

function mergeTheme(theme: ThemeArgument, outerTheme?: DefaultTheme): DefaultTheme {
  if (!theme) {
    throw styledError(14);
  }

  if (isFunction(theme)) {
    const themeFn = theme as ThemeFn;
    const mergedTheme = themeFn(outerTheme);

    if (
      process.env.NODE_ENV !== 'production' &&
      (mergedTheme === null || Array.isArray(mergedTheme) || typeof mergedTheme !== 'object')
    ) {
      throw styledError(7);
    }

    return mergedTheme;
  }

  if (Array.isArray(theme) || typeof theme !== 'object') {
    throw styledError(8);
  }

  return outerTheme ? { ...outerTheme, ...theme } : theme;
}

/**
 * Provide a theme to an entire react component tree via context
 */
export default function ThemeProvider(props: Props): JSX.Element | null {
  const outerTheme = useContext(ThemeContext);
  const themeContext = useMemo(
    () => mergeTheme(props.theme, outerTheme),
    [props.theme, outerTheme]
  );

  if (!props.children) {
    return null;
  }

  return <ThemeContext.Provider value={themeContext}>{props.children}</ThemeContext.Provider>;
}
