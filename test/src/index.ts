import { shellExpand } from "shell-expand";

function assertEq(actual: string[], expected: string[]) {
  if (actual.length !== expected.length) {
    throw new Error(
      `Expected ${expected.length} elements, got ${actual.length}`
    );
  }
  for (let i = 0; i < actual.length; i++) {
    if (actual[i] !== expected[i]) {
      throw new Error(`Expected ${expected[i]}, got ${actual[i]}`);
    }
  }
}

const vars = { TEST: "$TEST $TEST" };

assertEq(shellExpand("${TEST}", vars, { IFS: " " }), ["$TEST", "$TEST"]);
assertEq(shellExpand("$TEST", vars, { IFS: " " }), ["$TEST", "$TEST"]);
assertEq(shellExpand('"$TEST"', vars, { IFS: " " }), ["$TEST $TEST"]);
