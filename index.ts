/**
 * Affinity MCP Server
 *
 * MCP server that lets AI assistants control Affinity creative suite on macOS
 * via AppleScript and System Events.
 *
 * https://github.com/sekharmalla/affinity-mcp-server
 * MIT License — Copyright (c) 2025 Sekhar Malla
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { execSync } from "child_process";

// ─── Helpers ──────────────────────────────────────────────────────────

// The App Store version of Affinity registers as "Affinity Affinity Store"
// in System Events (not just "Affinity"). If you have the non-App Store
// version, change this to match your process name.
const PROCESS_NAME = "Affinity Affinity Store";

function osascript(script: string): string {
  try {
    return execSync(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`, {
      encoding: "utf-8",
      timeout: 30000,
    }).trim();
  } catch (e: any) {
    throw new Error(`AppleScript error: ${e.stderr || e.message}`);
  }
}

function systemEvents(action: string): string {
  return osascript(`
    tell application "System Events"
      tell process "${PROCESS_NAME}"
        ${action}
      end tell
    end tell
  `);
}

function keystroke(key: string, modifiers: string[] = []): string {
  const modStr =
    modifiers.length > 0
      ? ` using {${modifiers.map((m) => `${m} down`).join(", ")}}`
      : "";
  return systemEvents(`keystroke "${key}"${modStr}`);
}

function keyCode(code: number, modifiers: string[] = []): string {
  const modStr =
    modifiers.length > 0
      ? ` using {${modifiers.map((m) => `${m} down`).join(", ")}}`
      : "";
  return systemEvents(`key code ${code}${modStr}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function isAffinityRunning(): boolean {
  try {
    const result = execSync("pgrep -f 'Affinity Affinity Store'", {
      encoding: "utf-8",
    });
    return result.trim().length > 0;
  } catch {
    return false;
  }
}

function getWindows(): string[] {
  const result = systemEvents("return name of every window");
  return result
    .split(", ")
    .filter((n) => n && n !== "missing value");
}

// ─── MCP Server ───────────────────────────────────────────────────────

const server = new McpServer({
  name: "affinity-mcp",
  version: "1.0.0",
});

// ─── Tools ────────────────────────────────────────────────────────────

server.tool(
  "affinity_status",
  "Check if Affinity is running and get current state (open documents, windows)",
  {},
  async () => {
    const running = isAffinityRunning();
    if (!running) {
      return { content: [{ type: "text", text: "Affinity is not running." }] };
    }
    const windows = getWindows();
    return {
      content: [
        {
          type: "text",
          text: `Affinity is running.\nOpen windows:\n  ${windows.join("\n  ")}`,
        },
      ],
    };
  }
);

server.tool(
  "affinity_launch",
  "Launch Affinity app if not already running",
  {},
  async () => {
    if (isAffinityRunning()) {
      return { content: [{ type: "text", text: "Affinity is already running." }] };
    }
    execSync('open -a "Affinity"');
    await sleep(3000);
    return { content: [{ type: "text", text: "Affinity launched." }] };
  }
);

server.tool(
  "affinity_open_file",
  "Open a file in Affinity (image, .af, .psd, .svg, etc.)",
  { path: z.string().describe("Absolute path to the file to open") },
  async ({ path }) => {
    execSync(`open -a "Affinity" "${path}"`);
    await sleep(2000);
    const windows = getWindows();
    return {
      content: [
        { type: "text", text: `Opened file. Windows:\n  ${windows.join("\n  ")}` },
      ],
    };
  }
);

server.tool(
  "affinity_new_document",
  "Create a new document. fromLastPreset=true skips the dialog.",
  {
    fromLastPreset: z.boolean().default(false).describe("Create from last preset without dialog"),
  },
  async ({ fromLastPreset }) => {
    if (fromLastPreset) {
      systemEvents(
        `click menu item "New from Last Preset…" of menu 1 of menu bar item "File" of menu bar 1`
      );
    } else {
      keystroke("n", ["command"]);
    }
    await sleep(1500);
    const windows = getWindows();
    return {
      content: [{ type: "text", text: `New document created.\nWindows:\n  ${windows.join("\n  ")}` }],
    };
  }
);

server.tool(
  "affinity_click_menu",
  "Click a menu item. Path: ['File','Export','Export…'] for nested menus.",
  {
    menuPath: z.array(z.string()).min(2).describe("Menu path from menu bar to item"),
  },
  async ({ menuPath }) => {
    const menuBar = menuPath[0];
    const items = menuPath.slice(1);

    let script: string;
    if (items.length === 1) {
      script = `click menu item "${items[0]}" of menu 1 of menu bar item "${menuBar}" of menu bar 1`;
    } else if (items.length === 2) {
      script = `click menu item "${items[1]}" of menu "${items[0]}" of menu item "${items[0]}" of menu 1 of menu bar item "${menuBar}" of menu bar 1`;
    } else if (items.length === 3) {
      script = `click menu item "${items[2]}" of menu "${items[1]}" of menu item "${items[1]}" of menu "${items[0]}" of menu item "${items[0]}" of menu 1 of menu bar item "${menuBar}" of menu bar 1`;
    } else {
      throw new Error("Menu path too deep (max 4 levels)");
    }

    const result = systemEvents(script);
    await sleep(500);
    return {
      content: [{ type: "text", text: `Clicked: ${menuPath.join(" > ")}\n${result}` }],
    };
  }
);

server.tool(
  "affinity_get_menus",
  "List all items in a top-level menu (File, Edit, Pixel, etc.)",
  {
    menuName: z.string().describe("Top-level menu name"),
  },
  async ({ menuName }) => {
    const result = systemEvents(
      `return name of every menu item of menu 1 of menu bar item "${menuName}" of menu bar 1`
    );
    const items = result.split(", ").filter((i) => i !== "missing value");
    return {
      content: [
        { type: "text", text: `${menuName} menu:\n${items.map((i) => `  - ${i}`).join("\n")}` },
      ],
    };
  }
);

server.tool(
  "affinity_get_submenu",
  "List items in a submenu (e.g., File > Export)",
  {
    menuName: z.string().describe("Top-level menu name"),
    submenuItem: z.string().describe("Menu item that has a submenu"),
  },
  async ({ menuName, submenuItem }) => {
    const result = systemEvents(
      `return name of every menu item of menu "${submenuItem}" of menu item "${submenuItem}" of menu 1 of menu bar item "${menuName}" of menu bar 1`
    );
    const items = result.split(", ").filter((i) => i !== "missing value");
    return {
      content: [
        { type: "text", text: `${menuName} > ${submenuItem}:\n${items.map((i) => `  - ${i}`).join("\n")}` },
      ],
    };
  }
);

server.tool(
  "affinity_save",
  "Save the current document (Cmd+S) or Save As",
  {
    saveAs: z.boolean().default(false).describe("Use Save As dialog"),
    path: z.string().optional().describe("Absolute path for Save As"),
  },
  async ({ saveAs, path }) => {
    if (saveAs) {
      keystroke("s", ["command", "shift"]);
      await sleep(1000);
      if (path) {
        keystroke("g", ["command", "shift"]);
        await sleep(500);
        osascript(`
          tell application "System Events"
            tell process "${PROCESS_NAME}"
              set value of text field 1 of sheet 1 of sheet 1 of window 1 to "${path}"
              delay 0.3
              click button "Go" of sheet 1 of sheet 1 of window 1
              delay 0.5
              click button "Save" of sheet 1 of window 1
            end tell
          end tell
        `);
      }
    } else {
      keystroke("s", ["command"]);
    }
    await sleep(1000);
    return {
      content: [{ type: "text", text: saveAs ? `Saved as: ${path || "(dialog open)"}` : "Saved." }],
    };
  }
);

server.tool(
  "affinity_export",
  "Export current document via File > Export > Export…",
  {
    format: z.enum(["png", "jpg", "svg", "pdf", "eps", "tiff", "gif", "webp"]).optional().describe("Export format"),
  },
  async ({ format }) => {
    systemEvents(
      `click menu item "Export…" of menu "Export" of menu item "Export" of menu 1 of menu bar item "File" of menu bar 1`
    );
    await sleep(1500);

    if (format) {
      const formatMap: Record<string, string> = {
        png: "PNG", jpg: "JPEG", svg: "SVG", pdf: "PDF",
        eps: "EPS", tiff: "TIFF", gif: "GIF", webp: "WebP",
      };
      try {
        systemEvents(`click button "${formatMap[format] || format.toUpperCase()}" of window 1`);
        await sleep(500);
      } catch { /* format tab may not exist */ }
    }

    return {
      content: [
        { type: "text", text: `Export dialog opened${format ? ` (${format})` : ""}. Use affinity_get_ui to inspect, affinity_click_ui to interact.` },
      ],
    };
  }
);

server.tool(
  "affinity_keystroke",
  "Send a keystroke to Affinity with optional modifiers",
  {
    key: z.string().describe("Key to press"),
    modifiers: z.array(z.enum(["command", "shift", "option", "control"])).default([]).describe("Modifier keys"),
  },
  async ({ key, modifiers }) => {
    keystroke(key, modifiers);
    await sleep(300);
    return {
      content: [{ type: "text", text: `Sent: ${modifiers.length ? modifiers.join("+") + "+" : ""}${key}` }],
    };
  }
);

server.tool(
  "affinity_key_code",
  "Send a key code (Escape=53, Return=36, Delete=51, Tab=48, Left=123, Right=124, Down=125, Up=126)",
  {
    code: z.number().describe("Key code"),
    modifiers: z.array(z.enum(["command", "shift", "option", "control"])).default([]).describe("Modifier keys"),
  },
  async ({ code, modifiers }) => {
    keyCode(code, modifiers);
    await sleep(300);
    return {
      content: [{ type: "text", text: `Sent key code ${code}` }],
    };
  }
);

server.tool(
  "affinity_type_text",
  "Type text into Affinity (for text fields, dialogs, the text tool, etc.)",
  {
    text: z.string().describe("Text to type"),
  },
  async ({ text }) => {
    osascript(`
      tell application "System Events"
        tell process "${PROCESS_NAME}"
          keystroke "${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"
        end tell
      end tell
    `);
    await sleep(300);
    return { content: [{ type: "text", text: `Typed: "${text}"` }] };
  }
);

server.tool(
  "affinity_get_ui",
  "Inspect the frontmost Affinity window — buttons, text fields, dialogs, etc.",
  {},
  async () => {
    const result = osascript(`
      tell application "System Events"
        tell process "${PROCESS_NAME}"
          set windowNames to name of every window
          set output to "Windows: " & (windowNames as string)
          try
            set frontWin to window 1
            set output to output & return & "Front window: " & (name of frontWin as string)
            set output to output & return & "UI Elements:"
            set elems to every UI element of frontWin
            repeat with elem in elems
              try
                set elemRole to role of elem
                set elemDesc to description of elem
                set elemTitle to ""
                try
                  set elemTitle to title of elem
                end try
                set output to output & return & "  " & elemRole & " | " & elemDesc & " | " & elemTitle
              end try
            end repeat
          end try
          return output
        end tell
      end tell
    `);
    return { content: [{ type: "text", text: result }] };
  }
);

server.tool(
  "affinity_click_ui",
  "Click a UI element in the front window by description or title",
  {
    elementDescription: z.string().describe("Description or title of the element"),
    elementType: z.enum(["button", "checkbox", "radio button", "pop up button", "text field", "tab group"]).default("button"),
  },
  async ({ elementDescription, elementType }) => {
    try {
      systemEvents(`click ${elementType} "${elementDescription}" of window 1`);
    } catch {
      osascript(`
        tell application "System Events"
          tell process "${PROCESS_NAME}"
            click (first ${elementType} of window 1 whose description is "${elementDescription}")
          end tell
        end tell
      `);
    }
    await sleep(500);
    return { content: [{ type: "text", text: `Clicked ${elementType}: "${elementDescription}"` }] };
  }
);

server.tool(
  "affinity_select_tool",
  "Select a drawing/editing tool via keyboard shortcut",
  {
    tool: z.enum([
      "move", "artboard", "pen", "node", "rectangle", "ellipse", "text",
      "fill", "eyedropper", "zoom", "hand", "crop", "brush", "eraser",
      "clone", "dodge", "gradient",
    ]),
  },
  async ({ tool }) => {
    const shortcuts: Record<string, string> = {
      move: "v", artboard: "a", pen: "p", node: "a", rectangle: "m",
      ellipse: "m", text: "t", fill: "g", eyedropper: "i", zoom: "z",
      hand: "h", crop: "c", brush: "b", eraser: "e", clone: "s",
      dodge: "o", gradient: "g",
    };
    keystroke(shortcuts[tool]);
    await sleep(300);
    return { content: [{ type: "text", text: `Selected: ${tool}` }] };
  }
);

server.tool(
  "affinity_mouse_action",
  "Click or drag at screen coordinates. For drag, provide endX and endY.",
  {
    action: z.enum(["click", "drag"]),
    x: z.number().describe("X coordinate"),
    y: z.number().describe("Y coordinate"),
    endX: z.number().optional().describe("End X (drag only)"),
    endY: z.number().optional().describe("End Y (drag only)"),
  },
  async ({ action, x, y, endX, endY }) => {
    if (action === "click") {
      osascript(`tell application "System Events" to click at {${x}, ${y}}`);
    } else if (action === "drag" && endX !== undefined && endY !== undefined) {
      execSync(
        `python3 -c "
import Quartz, time
Quartz.CGEventPost(Quartz.kCGHIDEventTap, Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDown, (${x}, ${y}), Quartz.kCGMouseButtonLeft))
time.sleep(0.05)
for i in range(1, 21):
    cx = ${x} + (${endX} - ${x}) * i / 20
    cy = ${y} + (${endY} - ${y}) * i / 20
    Quartz.CGEventPost(Quartz.kCGHIDEventTap, Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseDragged, (cx, cy), Quartz.kCGMouseButtonLeft))
    time.sleep(0.01)
Quartz.CGEventPost(Quartz.kCGHIDEventTap, Quartz.CGEventCreateMouseEvent(None, Quartz.kCGEventLeftMouseUp, (${endX}, ${endY}), Quartz.kCGMouseButtonLeft))
"`,
        { encoding: "utf-8", timeout: 10000 }
      );
    }
    await sleep(300);
    return {
      content: [
        {
          type: "text",
          text: action === "drag" ? `Dragged (${x},${y}) → (${endX},${endY})` : `Clicked (${x},${y})`,
        },
      ],
    };
  }
);

server.tool(
  "affinity_screenshot",
  "Take a screenshot of the Affinity window",
  {
    outputPath: z.string().default("/tmp/affinity_screenshot.png").describe("Output path"),
  },
  async ({ outputPath }) => {
    // Capture the frontmost Affinity window
    execSync(`osascript -e 'tell application "Affinity" to activate'`);
    await sleep(500);
    execSync(`screencapture -w -o "${outputPath}" 2>/dev/null || screencapture "${outputPath}"`);
    return { content: [{ type: "text", text: `Screenshot: ${outputPath}` }] };
  }
);

server.tool(
  "affinity_close_document",
  "Close the current document",
  {
    save: z.boolean().default(false).describe("Save before closing"),
  },
  async ({ save }) => {
    if (save) {
      keystroke("s", ["command"]);
      await sleep(1000);
    }
    keystroke("w", ["command"]);
    await sleep(500);
    try {
      systemEvents(`click button "Don't Save" of sheet 1 of window 1`);
    } catch { /* no save dialog */ }
    await sleep(500);
    return { content: [{ type: "text", text: `Closed${save ? " (saved)" : ""}.` }] };
  }
);

server.tool(
  "affinity_document_ops",
  "Document operations: flatten, flip, rotate, clip/unclip canvas",
  {
    operation: z.enum([
      "flatten", "flip_horizontal", "flip_vertical",
      "rotate_cw", "rotate_ccw", "clip_canvas", "unclip_canvas",
    ]),
  },
  async ({ operation }) => {
    const map: Record<string, [string, string]> = {
      flatten: ["Document", "Flatten"],
      flip_horizontal: ["Document", "Flip Horizontal"],
      flip_vertical: ["Document", "Flip Vertical"],
      rotate_cw: ["Document", "Rotate 90° Clockwise"],
      rotate_ccw: ["Document", "Rotate 90° Counter-clockwise"],
      clip_canvas: ["Document", "Clip Canvas"],
      unclip_canvas: ["Document", "Unclip Canvas"],
    };
    const [menu, item] = map[operation];
    systemEvents(`click menu item "${item}" of menu 1 of menu bar item "${menu}" of menu bar 1`);
    await sleep(500);
    return { content: [{ type: "text", text: `Done: ${operation.replace(/_/g, " ")}` }] };
  }
);

server.tool(
  "affinity_add_layer",
  "Add a new layer (pixel, mask, adjustment, live filter, fill, pattern)",
  {
    layerType: z.enum(["pixel", "mask", "adjustment", "live_filter", "fill", "pattern"]),
  },
  async ({ layerType }) => {
    const items: Record<string, string> = {
      pixel: "New Pixel Layer", mask: "New Mask Layer",
      adjustment: "New Adjustment Layer", live_filter: "New Live Filter Layer",
      fill: "New Fill Layer", pattern: "New Pattern Layer…",
    };
    systemEvents(
      `click menu item "${items[layerType]}" of menu 1 of menu bar item "Pixel" of menu bar 1`
    );
    await sleep(500);
    return { content: [{ type: "text", text: `Added ${layerType} layer.` }] };
  }
);

server.tool(
  "affinity_undo_redo",
  "Undo or redo actions",
  {
    action: z.enum(["undo", "redo"]),
    times: z.number().default(1).describe("Number of times"),
  },
  async ({ action, times }) => {
    for (let i = 0; i < times; i++) {
      if (action === "undo") keystroke("z", ["command"]);
      else keystroke("z", ["command", "shift"]);
      await sleep(200);
    }
    return { content: [{ type: "text", text: `${action} ×${times}` }] };
  }
);

server.tool(
  "affinity_filters",
  "List available filters under Pixel > Filters submenu",
  {},
  async () => {
    const result = systemEvents(
      `return name of every menu item of menu "Filters" of menu item "Filters" of menu 1 of menu bar item "Pixel" of menu bar 1`
    );
    const items = result.split(", ").filter((i) => i !== "missing value");
    return {
      content: [{ type: "text", text: `Filters:\n${items.map((i) => `  - ${i}`).join("\n")}` }],
    };
  }
);

server.tool(
  "affinity_run_macro",
  "Import and run an .afmacro file",
  {
    macroPath: z.string().describe("Absolute path to .afmacro file"),
  },
  async ({ macroPath }) => {
    execSync(`open "${macroPath}"`);
    await sleep(2000);
    return {
      content: [
        { type: "text", text: `Imported macro from ${macroPath}. Check the Macro panel.` },
      ],
    };
  }
);

// ─── Start ────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
