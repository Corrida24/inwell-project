import React from 'react';

interface Props {
  children: React.ReactNode;
  /** Optional override for the fallback UI -- used to give report pages a
   * more specific message than the generic one below. */
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Catches render errors in its subtree and shows a fallback instead of
 * leaving the whole page white-screened -- there was no error boundary
 * anywhere in the app before this (see code review, section 6). A thrown
 * error inside, say, ReportView's render (e.g. a malformed `report` object
 * from a future backend change) used to take down the entire page; now it's
 * contained to this boundary.
 *
 * Class component because React error boundaries (componentDidCatch /
 * getDerivedStateFromError) have no hook equivalent as of React 19.
 *
 * NOTE: this project has no `@types/react` (or `@types/react-dom`) package
 * installed at all -- `apps/web/node_modules/react` ships no .d.ts files,
 * so every other `import React from 'react'` in this codebase silently
 * types as `any` and gets no real compile-time checking (harmless for
 * function components, since `any` just permits anything). Extending
 * `React.Component` doesn't get that same free pass: TypeScript treats a
 * class that `extends` an `any`-typed value as having ONLY the members the
 * subclass itself declares, not the base class's real members -- so
 * `props`/`state`/`setState` need to be redeclared explicitly below purely
 * for the type checker; the actual runtime values still come from React's
 * real `Component` implementation via `super(props)`, unaffected by this.
 * The real fix is adding `@types/react`/`@types/react-dom` as
 * devDependencies, which would very likely surface a batch of latent type
 * errors across the rest of the app (nothing has been checked against real
 * React types before) -- out of scope for this change, flagged here so
 * it isn't lost; see also the code review, section 6.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Props;
  declare state: State;
  declare setState: (state: Partial<State>) => void;

  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Same ad-hoc console-based logging convention already used elsewhere
    // in this codebase (no error-tracking service wired up yet -- see code
    // review, section 4/9). At minimum this keeps the error out of a
    // silent white screen and into the browser console.
    console.error('[ErrorBoundary] caught render error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-3">
          <p className="text-slate-900 font-semibold">Что-то пошло не так.</p>
          <p className="text-sm text-slate-500 max-w-sm">
            Попробуйте обновить страницу. Если ошибка повторяется, свяжитесь с нами.
          </p>
          <button
            onClick={this.handleReset}
            className="mt-1 px-4 py-2 rounded-full text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-light transition-all"
          >
            Попробовать снова
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
