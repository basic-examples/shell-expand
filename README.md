# `shell-expand`

Expand shell-style variable substitution

## Usage

Currently it works for flat input (1-depth) only and returns the result
split by a given `IFS` string (defaults to `" \t\n"`).

```ts
const vars = {
  TEST: '$TEST $TEST'
};
console.log(shellExpand('${TEST}', vars, { IFS: ' ' })); // ["$TEST", "$TEST"]
```
