**Rules and Guidelines for Writing JSDoc Comments**

---

### Purpose

This document defines the rules and guidelines for using JSDoc comments in the AI code editor environment. It ensures that all classes, modules, functions, and methods are documented consistently and thoroughly, following industry best practices.

---

### General Principles

1. **Clarity and Consistency**: Comments must be clear, concise, and consistent across the codebase.
2. **Comprehensiveness**: Document all public and internal APIs, including parameters, return types, errors, and usage notes.
3. **Maintainability**: Keep JSDoc comments up-to-date with code changes.
4. **Standard Format**: Follow the official JSDoc standard (https://jsdoc.app/).

---

### Required JSDoc Tags by Element Type

#### 1. **Modules**
```js
/**
 * @module ModuleName
 * @description Brief summary of the module’s purpose.
 */
```
- Use `@module` to define the module.
- Provide a concise and informative description.

#### 2. **Classes**
```js
/**
 * Class representing a [concept].
 * @class
 * @example
 * const instance = new MyClass();
 */
```
- Use `@class` to indicate the element is a class.
- Add a usage example using `@example`.
- Mention dependencies or related classes if applicable.

#### 3. **Constructors**
```js
/**
 * Create an instance of MyClass.
 * @constructor
 * @param {string} name - The name of the instance.
 * @param {number} id - Unique identifier.
 */
```
- Use `@constructor`.
- Describe all parameters with types and usage notes.

#### 4. **Functions and Methods**
```js
/**
 * [Brief description of what the function does.]
 * @function
 * @param {Type} paramName - Description of the parameter.
 * @returns {ReturnType} Description of the return value.
 * @throws {ErrorType} Condition under which an error is thrown.
 * @example
 * doSomething('input');
 */
```
- Use `@function` or `@method`.
- Include `@param` for each parameter.
- Always include `@returns`, even if it’s `void`.
- Use `@throws` when applicable.
- Provide an `@example` block.

#### 5. **Private/Internal APIs**
```js
/**
 * @private
 * [Private method description.]
 */
```
- Tag internal APIs with `@private` or `@internal`.

---

### Formatting Guidelines

- Start every JSDoc block with `/**` and end with `*/`.
- Use `*` on each intermediate line for alignment.
- Use markdown-like formatting (`**bold**`, `*italic*`, etc.) sparingly and only where supported.
- Align parameter names and types for readability.

---

### Best Practices

- **Document intent**, not just implementation.
- **Use proper grammar and punctuation**.
- **Avoid redundancy**—don't repeat the method name in the description.
- **Include edge cases or caveats** in the description if applicable.
- **Use `@see`**, `@link`, and `@deprecated` tags as needed for navigation and maintainability.
