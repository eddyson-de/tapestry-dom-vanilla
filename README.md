# tapestry-dom-vanilla
t5/core/dom implementation based on vanilla JavaScript

This is an implementation of `t5/core/dom` that uses only plain JavaScript, i.e. does not add a dependency on jQuery or Prototype.

## Current status
The project is in its very early stages, so things will probably break if you try to use it. Be sure to create an issue or send a pull request if they do.

## Usage

### `build.gradle`:
```groovy
repositories {
  jcenter()
}

dependencies {
  runtime 'de.eddyson:tapestry-dom-vanilla:0.0.6'
}

```
The library adds an override for `tapestry.javascript-infrastructure-provider` symbol's default value. Please make sure that your application does not override it.
