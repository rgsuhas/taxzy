#!/usr/bin/env node
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, def) => new Promise((res) => rl.question(`${q} [${def}]: `, (a) => res(a.trim() || def)));

async function main() {
  console.log("\nTaxzy — frontend setup\n");
  const apiUrl = await ask("Backend API URL", "http://localhost:8000");
  const useMocks = await ask("Use mocks? (true/false)", "false");
  rl.close();

  const env = `NEXT_PUBLIC_API_URL=${apiUrl}\nNEXT_PUBLIC_USE_MOCKS=${useMocks}\n`;
  fs.writeFileSync(path.join(__dirname, ".env.local"), env);
  console.log("\n.env.local written. Run: npm run dev\n");
}

main();
