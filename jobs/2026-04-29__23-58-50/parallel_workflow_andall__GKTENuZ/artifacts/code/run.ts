import { parallelWorkflow } from './index';
import * as fs from 'fs';

async function main() {
  const result = await parallelWorkflow.run("Test input string");
  if (result.error) {
     console.error("Workflow error:", result.error);
  }
  fs.writeFileSync('/home/user/my-agent-app/output.json', JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
