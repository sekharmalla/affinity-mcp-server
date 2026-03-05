# Affinity MCP Server — Tool Reference

Complete API documentation for all 23 tools. Each tool is called as an MCP tool via the affinity-mcp-server.

---

## App Lifecycle

### affinity_status

Check if Affinity is running and list open windows.

**Parameters:** None

**Returns:** Running state and list of open window names.

**Example:**
```
affinity_status()
→ "Affinity is running.\nOpen windows:\n  Untitled\n  My Poster.afdesign"
```

---

### affinity_launch

Launch Affinity if not already running. Waits 3 seconds for startup.

**Parameters:** None

**Returns:** Confirmation that Affinity launched or was already running.

**Example:**
```
affinity_launch()
→ "Affinity launched."
```

---

## File Operations

### affinity_open_file

Open a file in Affinity (image, .af, .psd, .svg, etc.).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `path` | string | Yes | Absolute path to the file to open |

**Example:**
```
affinity_open_file({ path: "/Users/me/poster.afdesign" })
→ "Opened file. Windows:\n  poster.afdesign"
```

---

### affinity_new_document

Create a new document. Set `fromLastPreset` to skip the new document dialog.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `fromLastPreset` | boolean | No | `false` | Create from last preset without dialog |

**Examples:**
```
affinity_new_document()
→ Opens the new document dialog

affinity_new_document({ fromLastPreset: true })
→ Creates document from last used preset, no dialog
```

---

### affinity_save

Save the current document (Cmd+S) or Save As to a specific path.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `saveAs` | boolean | No | `false` | Use Save As dialog |
| `path` | string | No | — | Absolute path for Save As |

**Examples:**
```
affinity_save()
→ "Saved."

affinity_save({ saveAs: true, path: "/Users/me/poster.afdesign" })
→ "Saved as: /Users/me/poster.afdesign"
```

---

### affinity_export

Open the export dialog via File > Export. Optionally select a format tab.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `format` | enum | No | — | One of: png, jpg, svg, pdf, eps, tiff, gif, webp |

After calling this tool, use `affinity_get_ui` to inspect the dialog and `affinity_click_ui` to interact.

**Example:**
```
affinity_export({ format: "png" })
→ "Export dialog opened (png). Use affinity_get_ui to inspect, affinity_click_ui to interact."
```

---

### affinity_close_document

Close the current document.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `save` | boolean | No | `false` | Save before closing |

**Example:**
```
affinity_close_document({ save: true })
→ "Closed (saved)."
```

---

## Menu System

### affinity_click_menu

Click a menu item by path. The path is an array starting from the menu bar item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `menuPath` | string[] | Yes | Menu path from menu bar to item (min 2 elements, max 4 levels) |

**Examples:**
```
affinity_click_menu({ menuPath: ["File", "New"] })
→ Clicks File > New

affinity_click_menu({ menuPath: ["File", "Export", "Export…"] })
→ Clicks File > Export > Export…

affinity_click_menu({ menuPath: ["Pixel", "Filters", "Blur", "Gaussian Blur…"] })
→ Clicks Pixel > Filters > Blur > Gaussian Blur…
```

---

### affinity_get_menus

List all items in a top-level menu.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `menuName` | string | Yes | Top-level menu name (e.g., "File", "Edit", "Pixel") |

**Example:**
```
affinity_get_menus({ menuName: "File" })
→ "File menu:\n  - New\n  - New from Last Preset…\n  - Open…\n  ..."
```

---

### affinity_get_submenu

List items in a submenu.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `menuName` | string | Yes | Top-level menu name |
| `submenuItem` | string | Yes | Menu item that has a submenu |

**Example:**
```
affinity_get_submenu({ menuName: "File", submenuItem: "Export" })
→ "File > Export:\n  - Export…\n  - Export as PDF…"
```

---

## UI Inspection & Interaction

### affinity_get_ui

Inspect the frontmost Affinity window. Returns all UI elements with their role, description, and title.

**Parameters:** None

**Returns:** List of windows and UI elements in the front window.

**Example:**
```
affinity_get_ui()
→ "Windows: Untitled\nFront window: Untitled\nUI Elements:\n  AXButton | close button | \n  AXButton | Export | Export\n  ..."
```

---

### affinity_click_ui

Click a UI element in the front window by its description or title.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `elementDescription` | string | Yes | — | Description or title of the element |
| `elementType` | enum | No | `"button"` | One of: button, checkbox, radio button, pop up button, text field, tab group |

**Example:**
```
affinity_click_ui({ elementDescription: "Export", elementType: "button" })
→ "Clicked button: \"Export\""
```

---

## Input

### affinity_keystroke

Send a keystroke to Affinity with optional modifier keys.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `key` | string | Yes | — | Key to press |
| `modifiers` | string[] | No | `[]` | Modifier keys: command, shift, option, control |

**Examples:**
```
affinity_keystroke({ key: "s", modifiers: ["command"] })
→ "Sent: command+s"

affinity_keystroke({ key: "b", modifiers: ["command"] })
→ "Sent: command+b" (Bold)
```

---

### affinity_key_code

Send a key code to Affinity. Useful for non-character keys.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `code` | number | Yes | — | Key code (Escape=53, Return=36, Delete=51, Tab=48, Left=123, Right=124, Down=125, Up=126) |
| `modifiers` | string[] | No | `[]` | Modifier keys: command, shift, option, control |

**Example:**
```
affinity_key_code({ code: 53 })
→ "Sent key code 53" (Escape)
```

---

### affinity_type_text

Type text into Affinity — for text fields, dialogs, or the text tool.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Text to type |

**Example:**
```
affinity_type_text({ text: "Hello World" })
→ "Typed: \"Hello World\""
```

---

### affinity_mouse_action

Click or drag at screen coordinates. For drag operations, provide start and end coordinates.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | enum | Yes | "click" or "drag" |
| `x` | number | Yes | X coordinate |
| `y` | number | Yes | Y coordinate |
| `endX` | number | No | End X coordinate (drag only) |
| `endY` | number | No | End Y coordinate (drag only) |

Drag uses Python's Quartz framework for smooth 20-step coordinate interpolation.

**Examples:**
```
affinity_mouse_action({ action: "click", x: 400, y: 300 })
→ "Clicked (400,300)"

affinity_mouse_action({ action: "drag", x: 100, y: 100, endX: 400, endY: 300 })
→ "Dragged (100,100) → (400,300)"
```

---

## Drawing & Tools

### affinity_select_tool

Select a drawing/editing tool via its keyboard shortcut.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tool` | enum | Yes | One of: move, artboard, pen, node, rectangle, ellipse, text, fill, eyedropper, zoom, hand, crop, brush, eraser, clone, dodge, gradient |

**Shortcut mapping:**
| Tool | Key | Tool | Key |
|------|-----|------|-----|
| move | V | fill | G |
| artboard | A | eyedropper | I |
| pen | P | zoom | Z |
| node | A | hand | H |
| rectangle | M | crop | C |
| ellipse | M | brush | B |
| text | T | eraser | E |
| clone | S | dodge | O |
| gradient | G | | |

Note: Some tools share shortcuts (rectangle/ellipse both use M — press M multiple times to cycle). Similarly artboard/node share A.

**Example:**
```
affinity_select_tool({ tool: "rectangle" })
→ "Selected: rectangle"
```

---

## Document Operations

### affinity_document_ops

Perform document-level operations via the Document menu.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `operation` | enum | Yes | One of: flatten, flip_horizontal, flip_vertical, rotate_cw, rotate_ccw, clip_canvas, unclip_canvas |

**Example:**
```
affinity_document_ops({ operation: "flatten" })
→ "Done: flatten"
```

---

### affinity_add_layer

Add a new layer to the document.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `layerType` | enum | Yes | One of: pixel, mask, adjustment, live_filter, fill, pattern |

Layers are added via the Pixel menu.

**Example:**
```
affinity_add_layer({ layerType: "pixel" })
→ "Added pixel layer."
```

---

### affinity_undo_redo

Undo or redo actions, optionally multiple times.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `action` | enum | Yes | — | "undo" or "redo" |
| `times` | number | No | `1` | Number of times to undo/redo |

**Example:**
```
affinity_undo_redo({ action: "undo", times: 3 })
→ "undo ×3"
```

---

## Filters & Macros

### affinity_filters

List available filters under the Pixel > Filters submenu.

**Parameters:** None

**Returns:** List of available filter names.

**Example:**
```
affinity_filters()
→ "Filters:\n  - Blur\n  - Sharpen\n  - Distort\n  ..."
```

---

### affinity_run_macro

Import and run an .afmacro file.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `macroPath` | string | Yes | Absolute path to .afmacro file |

**Example:**
```
affinity_run_macro({ macroPath: "/Users/me/effects/vintage.afmacro" })
→ "Imported macro from /Users/me/effects/vintage.afmacro. Check the Macro panel."
```

---

## Capture

### affinity_screenshot

Take a screenshot of the Affinity window.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `outputPath` | string | No | `/tmp/affinity_screenshot.png` | Output file path |

**Example:**
```
affinity_screenshot({ outputPath: "/tmp/my_screenshot.png" })
→ "Screenshot: /tmp/my_screenshot.png"
```
