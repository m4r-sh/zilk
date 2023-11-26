# engine

Default (opinionated) Builder.

Entirely overrideable / customizable build system to create websites and webapps.

`views`: component definitions for UI

`routes`: filesystem route logic for dynamic or static server responses

`assets`: static assets & SSR assets (.html.js)

`models`: behavior definitions for reactive state

`data`: define data sources for import by other files (routes & assets)



# Builds

Builds should be defined in modular orb graph networks. async get() dependencies work well.

Some outputs of defined builds should be optional, of course. Minified build should be included, but
if minified isn't asked for, that get() should never be run.

Lazy, then eager.

Builds can be competitive, as long as each folder category has a consistent syntax and expected API. Views, routes, assets, models, etc. can be super useful primitives for build steps to collaborate on.

Can have optional fields for builds that want to add specificity for custom functionality.

Might be possible to have { default, handlers, style } as the OUTPUT of a different kind of file.

