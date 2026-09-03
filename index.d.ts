// Keep imports/exports inside these blocks so they remain ambient modules.
// All public package entry points load this file.

declare module 'zilk' {
  /** Use native platform types when available without forcing DOM libs on SSR consumers. */
  export type PlatformInstance<Name extends PropertyKey> = typeof globalThis extends {
    [Key in Name]: { prototype: infer Instance };
  } ? Instance : any;

  /**
   * Class proxies deliberately use any: arbitrary property chains also need to
   * work as computed object keys and in APIs accepting strings, without casts.
   * At runtime this is a recursive, string-coercible proxy, not a primitive string.
   */
  export type ClassName = any;
  export function classify(name: string): ClassName;

  /** Template inputs and results stay loose across the DOM and SSR runtimes. */
  export type TemplateTag = (strings: TemplateStringsArray | string, ...values: any[]) => any;

  /** Every property selects a template tag; language names are open-ended. */
  export interface TemplateProxy extends TemplateTag {
    [language: string]: TemplateTag;
  }

  export const html: TemplateTag;
  export const svg: TemplateTag;
  export const raw: TemplateProxy;
  export const fmt: TemplateProxy;
  export const css: TemplateTag;
  export const md: TemplateTag;
  export const glsl: TemplateTag;
  export const wgsl: TemplateTag;

  /** Bound tag factories in the DOM runtime; aliases of html/svg in SSR. */
  export const htmlFor: (...args: any[]) => any;
  export const svgFor: (...args: any[]) => any;

  /** SSR accepts a string consumer (including String); DOM rendering returns where. */
  export function render<T>(where: (content: string) => T, what: any): T;
  export function render<T>(where: T, what: any): T;

  /** The constructor and instance shape differ between the DOM and SSR runtimes. */
  export class Hole {
    constructor(...args: any[]);
    [property: string]: any;
    toString(): string;
  }
}

declare module 'zilk/dom' {
  export * from 'zilk';
}

declare module 'zilk/ssr' {
  export * from 'zilk';
}

declare module 'zilk/hydrate' {
  import type { PlatformInstance } from 'zilk';

  /** The built-in HTMLElement, with room for application-defined properties. */
  export type HydratedElement = PlatformInstance<'HTMLElement'> & Record<string, any>;

  export interface HydrationContext {
    element: HydratedElement;
    el: HydratedElement;
    $(selector: any): any;
    $$(selector: any): any[];
    [property: string]: any;
  }

  /** Custom state and methods are allowed alongside lifecycle and event handlers. */
  export type Handler = {
    init?(): any;
    connected?(): any;
    disconnected?(): any;
    observedAttributes?: string[];
    attributeChanged?(name: string, oldValue: string | null, newValue: string | null): any;
    handleEvent?(event: any): any;
    [event: `on${string}`]: ((event: any, ...args: any[]) => any) | boolean | Record<string, any>;
    [property: string]: any;
  } & ThisType<HydrationContext>;

  export type Handlers = Record<string, Handler>;

  export function hydrate(...definitions: Handlers[]): void;
  export function hydrateAsync(locations: Record<string, () => Promise<{
    handlers: Handlers;
    [exportName: string]: any;
  }>>): void;
}

declare module 'zilk/nav' {
  /** Page data and request extensions are application-defined. */
  export interface PageModule {
    meta(req: any): any;
    content(req: any): any;
    pull?(req: any): any;
    [exportName: string]: any;
  }

  export interface PageResult {
    meta: any;
    content: any;
    req: any;
  }

  export interface RouterOptions {
    pull?: string;
    pages?: Record<string, PageModule>;
    redirects?: Record<string, string>;
  }

  export interface TransitionResult extends PageResult {
    history: string[];
    index: number;
    source: string;
  }

  export interface Router {
    route(url: string, options?: { replace?: boolean; source?: string }): void;
    back(fallback?: string): void;
    forward(): void;
    onStart(callback: (info: { url: string; source: string }) => any): () => void;
    /** Return false to cancel navigation. */
    onBefore(callback: (req: any) => any): () => void;
    onReady(callback: (result: PageResult) => any): () => void;
    onAfter(callback: (result: PageResult) => any): () => void;
    onError(callback: (error: any) => any): () => void;
    onCancel(callback: (url: string) => any): () => void;
    performTransition(callback: (result: TransitionResult) => any): void;
  }

  export function createRouter(options?: RouterOptions): Router;
}

declare module 'zilk/navigation' {
  import type { PageModule, PageResult, RouterOptions } from 'zilk/nav';

  export interface NavigationResult extends PageResult {
    /** Kept loose so consumers do not need experimental Navigation API typings. */
    event: any;
  }

  export interface NavigationOptions extends RouterOptions {
    transition(result: NavigationResult): any;
    notFound?: PageModule;
  }

  /** Returns a function that removes the navigation listener. */
  export function createRouter(options: NavigationOptions): () => void;
}

declare module 'zilk/fetch' {
  import type { PlatformInstance } from 'zilk';
  import type { RouterOptions } from 'zilk/nav';

  export type RouteHandler = (req: any, ...args: any[]) => any;
  export type Route = RouteHandler | PlatformInstance<'Response'> | Record<string, RouteHandler | PlatformInstance<'Response'>>;

  export interface HandlerOptions extends RouterOptions {
    routes?: Record<string, Route>;
    template?(result: { meta: any; content: any }): any;
  }

  export type FetchHandler = (request: PlatformInstance<'Request'>, ...args: any[]) => Promise<PlatformInstance<'Response'>>;
  export function createHandler(options?: HandlerOptions): FetchHandler;
}
