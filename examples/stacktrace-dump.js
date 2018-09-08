//const unify = require("unify-paths").default;
const unify = require("../").default;
//import unify from ("unify-paths");

function dumpEr() {
  throw new Error("kabloowy!");
}

function main() {
  try {
    dumpEr();
  } catch (ex) {
    console.error(unify(ex.stack, {
      cwdPathPrefix: __dirname
    }));
    console.error("\n========================================\n", ex.stack);
  }
}

main();
