Developers often encounter friction (Issue #428) when attempting to combine JSON structured output generation with multi-step tool calling, leading to model confusion or schema validation errors.

You need to implement a reliable extraction script that cleanly separates these concerns. The script must first execute an agent that invokes a data-fetching tool, and then pass the tool's result to a secondary step that securely formats the data into a strictly typed JSON object without triggering schema conflicts.

**Constraints:**
- Must clearly decouple the tool execution step from the final structured object generation.
- The final output must be strictly typed using a Zod schema.
- Must ensure that provider-specific tool result edge cases (e.g., `undefined` toolResults) are gracefully handled.