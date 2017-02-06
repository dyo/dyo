# Roadmap

## Explore WASAM layer

Once WASAM matures, the idea is to re-build the reconciler of [dio in C++](https://github.com/thysultan/VR) where shapes are consistently monomorphic making it easier to reason about in a strongly typed language.

## Explore React Native like layer

An inter-op layer that acts like a polyfill of the DOM which will queue actions that are flushed at the end of a frame cycles budget to the target environment, this will also allow any vdom library to target other native targets(iOS, OSX, webGL, etc)