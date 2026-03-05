<div align="center">

# Affinity MCP Server

**Let AI control Affinity creative suite on macOS**

<img src="assets/poster.png" alt="Claude Code meets Affinity — poster designed and exported by this MCP server" width="600" />

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![macOS](https://img.shields.io/badge/platform-macOS-lightgrey.svg)](#prerequisites)
[![MCP](https://img.shields.io/badge/protocol-MCP-green.svg)](https://modelcontextprotocol.io)

*The poster above was designed in Affinity and exported by Claude — through this very MCP server.*

</div>

---

## What is this?

An [MCP (Model Context Protocol)](https://modelcontextprotocol.io) server that gives AI assistants like Claude full control over the **Affinity** creative suite on macOS. It bridges the gap between AI and professional design software — launch apps, navigate menus, draw shapes, apply filters, export files, and more — all through natural language.

## Features

- **23 tools** covering the complete Affinity workflow
- **Unified Affinity app** support (Affinity by Canva)
- **Menu navigation** — browse and click any menu item up to 4 levels deep
- **UI inspection** — read buttons, dialogs, text fields, and interact with them
- **Mouse & keyboard** — click, drag, type text, send shortcuts and key codes
- **Screenshots** — capture the Affinity window for visual feedback
- **Document ops** — create, open, save, export, flatten, rotate, flip
- **Layers & filters** — add layers, list filters, import macros

## Prerequisites

- **macOS** (uses AppleScript and System Events)
- **[Affinity by Canva](https://affinity.serif.com)** (v2 — the unified app)
- **[Bun](https://bun.sh)** runtime (v1.0.0+)
- **Accessibility permissions** — System Settings > Privacy & Security > Accessibility — grant access to your terminal app and/or Claude Desktop

## Quick Start

```bash
# Clone the repo
git clone https://github.com/sekharmalla/affinity-mcp-server.git
cd affinity-mcp-server

# Install dependencies
bun install

# Run the server
bun run start
```

## Install as Claude Code Plugin

The easiest way to get started with Claude Code — one command, no manual config:

```bash
claude plugin add /path/to/affinity-mcp-server
```

This automatically:
- Registers the MCP server (all 23 tools available immediately)
- Installs the **affinity-design skill** — workflow guidance that teaches Claude how to orchestrate the tools for real design tasks (create posters, export files, navigate menus, etc.)

The skill is the key value-add: the MCP tools are low-level primitives (click here, type this), but the skill provides high-level workflow knowledge (how to create a poster, how to export for web, how to navigate Affinity's UI patterns).

## Configuration

Add the server to your AI client's MCP configuration:

### Claude Code

```bash
claude mcp add affinity-mcp-server bun run /path/to/affinity-mcp-server/index.ts
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "affinity-mcp-server": {
      "command": "bun",
      "args": ["run", "/path/to/affinity-mcp-server/index.ts"]
    }
  }
}
```

### Cursor

Add to `.cursor/mcp.json` in your project:

```json
{
  "mcpServers": {
    "affinity-mcp-server": {
      "command": "bun",
      "args": ["run", "/path/to/affinity-mcp-server/index.ts"]
    }
  }
}
```

### VS Code

Add to `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "affinity-mcp-server": {
      "command": "bun",
      "args": ["run", "/path/to/affinity-mcp-server/index.ts"]
    }
  }
}
```

## Tool Reference

### App Lifecycle

| Tool | Description |
|------|-------------|
| `affinity_status` | Check if Affinity is running, list open windows |
| `affinity_launch` | Launch Affinity if not already running |

### File Operations

| Tool | Description |
|------|-------------|
| `affinity_open_file` | Open a file in Affinity (image, .af, .psd, .svg, etc.) |
| `affinity_new_document` | Create a new document, optionally from last preset |
| `affinity_save` | Save or Save As the current document |
| `affinity_export` | Export via File > Export (PNG, JPG, SVG, PDF, etc.) |
| `affinity_close_document` | Close the current document |

### Menu System

| Tool | Description |
|------|-------------|
| `affinity_click_menu` | Click any menu item by path (up to 4 levels deep) |
| `affinity_get_menus` | List all items in a top-level menu |
| `affinity_get_submenu` | List items in a submenu |

### UI Inspection & Interaction

| Tool | Description |
|------|-------------|
| `affinity_get_ui` | Inspect the front window — buttons, text fields, dialogs |
| `affinity_click_ui` | Click a UI element by description or title |

### Input

| Tool | Description |
|------|-------------|
| `affinity_keystroke` | Send a keystroke with optional modifiers |
| `affinity_key_code` | Send a key code (Escape, Return, arrows, etc.) |
| `affinity_type_text` | Type text into text fields, dialogs, or the text tool |
| `affinity_mouse_action` | Click or drag at screen coordinates |

### Drawing & Tools

| Tool | Description |
|------|-------------|
| `affinity_select_tool` | Select a tool (move, pen, rectangle, text, brush, etc.) |

### Document Operations

| Tool | Description |
|------|-------------|
| `affinity_document_ops` | Flatten, flip, rotate, clip/unclip canvas |
| `affinity_add_layer` | Add a layer (pixel, mask, adjustment, fill, etc.) |
| `affinity_undo_redo` | Undo or redo actions |

### Filters & Macros

| Tool | Description |
|------|-------------|
| `affinity_filters` | List available filters |
| `affinity_run_macro` | Import and run an .afmacro file |

### Capture

| Tool | Description |
|------|-------------|
| `affinity_screenshot` | Take a screenshot of the Affinity window |

## How It Works

```
AI Client  ──stdio──>  MCP Server  ──execSync──>  osascript  ──AppleScript──>  System Events  ──>  Affinity
```

The server receives MCP tool calls over stdio, translates them into AppleScript commands, and executes them via `osascript`. System Events handles menu navigation, UI interaction, and keyboard/mouse input. For drag operations, it uses Python's Quartz framework for smooth coordinate interpolation.

## The Story Behind the Poster

The poster at the top of this README wasn't designed by a human in Affinity. It was created by **Claude using this MCP server** — opening Affinity, creating a document, placing elements, styling text, and exporting the final PNG. It's the ultimate proof that this tool works: the project's marketing material was made by the project itself.

## Troubleshooting

### Accessibility Permissions

The server needs Accessibility access to control Affinity via System Events. Go to **System Settings > Privacy & Security > Accessibility** and add your terminal app (Terminal, iTerm2, Warp, etc.) and/or Claude Desktop.

### Process Name Quirk

The App Store version of Affinity registers as `"Affinity Affinity Store"` in System Events — not just `"Affinity"`. This is hardcoded as `PROCESS_NAME` in `index.ts`. If you have the non-App Store version, you may need to change this to `"Affinity 2"` or whatever your version reports.

To check your process name:
```bash
osascript -e 'tell application "System Events" to return name of every process whose name contains "Affinity"'
```

### Screenshot Permissions

For `affinity_screenshot`, you also need **Screen Recording** permission in System Settings > Privacy & Security > Screen Recording.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding tools, submitting PRs, and reporting issues.

## License

[MIT](LICENSE) — Copyright (c) 2025 Sekhar Malla
