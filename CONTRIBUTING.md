# Contributing to Affinity MCP Server

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

1. **Fork** the repo and clone your fork
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the dev server:
   ```bash
   bun run dev
   ```

## Development Setup

- **Runtime**: [Bun](https://bun.sh) (v1.0.0+)
- **Language**: TypeScript
- **Platform**: macOS only (uses AppleScript + System Events)
- **Affinity**: You'll need Affinity by Canva installed to test tools

## Project Structure

```
index.ts          # All MCP server code — tools, helpers, server setup
package.json      # Project metadata and dependencies
tsconfig.json     # TypeScript configuration
```

The entire server lives in a single `index.ts` file. This is intentional — it keeps the MCP server simple and self-contained.

## Adding a New Tool

1. Add your tool in `index.ts` using `server.tool()`:
   ```ts
   server.tool(
     "affinity_your_tool",        // snake_case, prefixed with affinity_
     "Description of what it does",
     { /* zod schema for params */ },
     async (params) => {
       // implementation using osascript(), systemEvents(), keystroke(), etc.
       return { content: [{ type: "text", text: "Result" }] };
     }
   );
   ```
2. Use the existing helpers (`osascript`, `systemEvents`, `keystroke`, `keyCode`) where possible
3. Add appropriate `await sleep()` calls after UI interactions
4. Update the tool reference table in `README.md`

## Pull Request Guidelines

- Keep PRs focused — one tool or feature per PR
- Test your changes with a real Affinity instance
- Update documentation if you add/change tools
- Write clear commit messages

## Reporting Issues

Use the [GitHub issue templates](https://github.com/sekharmalla/affinity-mcp-server/issues/new/choose) for:
- **Bug reports**: Include your macOS version, Affinity version, and the tool/error output
- **Feature requests**: Describe the use case and proposed tool API

## Code Style

- Use the existing patterns in `index.ts` as reference
- Prefer `systemEvents()` for UI automation over raw `osascript()`
- Always handle errors gracefully — tools should return helpful messages, not crash the server
- Use `z` (zod) for all parameter validation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
