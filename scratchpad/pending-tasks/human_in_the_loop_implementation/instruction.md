Many enterprise use cases require explicit human authorization before an agent executes a destructive action, such as modifying a database or sending an email.

You need to implement a workflow script that incorporates VoltAgent's `suspend` and `resume` capabilities. The workflow should pause right before a "delete record" tool is called, wait for a mock manual approval payload, and then successfully resume the workflow to complete the action.

**Constraints:**
- The script must demonstrably halt execution using VoltAgent's native `suspend` API.
- You must provide the invocation code that triggers the `resume` function with the required human approval state.
- Do NOT simulate the pause using standard `setTimeout` or `Promise` delays.