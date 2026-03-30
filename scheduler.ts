import { runNewsAgent } from "./src/lib/agent";

async function main() {
  console.log("スケジューラー起動:", new Date().toISOString());
  await runNewsAgent();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
