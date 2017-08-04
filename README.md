# tapestry-dom-vanilla
t5/core/dom implementation based on vanilla JavaScript

This is an implementation of `t5/core/dom` that uses only plain JavaScript, i.e. does not add a dependency on jQuery or Prototype. It it is aimed to be a drop-in replacement for the `t5/core/dom` implementations that come with Tapestry. It is however not necessarily compatible with old and/or broken browsers. It is expected to run with recent versions of Firefox, Chrome and Edge.

## Current status
The project is in its very early stages, so things will probably break if you try to use it. Be sure to create an issue or send a pull request if they do.

## Usage

### `build.gradle`:
```groovy
repositories {
  jcenter()
}

dependencies {
  runtime 'de.eddyson:tapestry-dom-vanilla:0.0.29'
}

```
The library adds an override for `tapestry.javascript-infrastructure-provider` symbol's default value. Please make sure that your application does not override it.
