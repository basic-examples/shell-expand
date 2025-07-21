# `shell-expand`

Expand shell-style variable substitution

## Usage

Currently it works for flat input (1-depth) only.

```ts
const vars = {
  TEST: '$TEST $TEST'
};
console.log(shellExpand('${TEST}', vars)); // "$TEST $TEST"
```
