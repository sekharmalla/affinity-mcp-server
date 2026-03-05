---
name: affinity-design
description: >
  Use this skill when the user wants to design in Affinity, create a poster,
  make a graphic, edit an image in Affinity, export from Affinity, open Affinity,
  draw shapes, add text in Affinity, apply filters, automate Affinity workflows,
  or control the Affinity creative suite on macOS.
---

# Affinity Design Workflow Skill

This skill teaches you how to orchestrate 23 MCP tools to control Affinity creative suite on macOS. The tools are low-level primitives — this skill provides the high-level workflow knowledge to combine them into real design tasks.

## Affinity UI Mental Model

Understand Affinity's interface before interacting with it:

- **Menu bar**: File, Edit, Text, Document, Pixel, View, Window, Help — access via `affinity_get_menus` and `affinity_click_menu`
- **Toolbar**: Drawing and editing tools along the left — access via `affinity_select_tool`
- **Canvas**: The central work area — interact via `affinity_mouse_action` with screen coordinates
- **Panels**: Right side (Layers, Color, Swatches, etc.) — inspect via `affinity_get_ui`, interact via `affinity_click_ui`
- **Dialogs**: Modal windows for export, save, preferences — inspect and interact via `affinity_get_ui` + `affinity_click_ui`

## Core Workflow Patterns

### Start a Session

Always begin by checking status, launching if needed, then creating or opening a document:

1. Call `affinity_status` to check if Affinity is running and see open windows
2. Call `affinity_launch` if not running (waits 3 seconds for startup)
3. Call `affinity_new_document` to create a blank document, or `affinity_open_file` to open an existing file
4. Call `affinity_screenshot` to confirm the current state visually

### Navigate the Menu System

Explore menus before clicking — never guess menu item names:

1. Call `affinity_get_menus` with a top-level menu name (e.g., "File", "Edit", "Pixel") to list all items
2. Call `affinity_get_submenu` for items that have submenus (e.g., File > Export, Pixel > Filters)
3. Call `affinity_click_menu` with the full path array (e.g., `["File", "Export", "Export…"]`)

Menu paths use an array from the menu bar item down to the target item. Maximum depth is 4 levels.

### Inspect and Interact with UI

When dialogs, panels, or unknown UI appears:

1. Call `affinity_get_ui` to list all UI elements in the front window (buttons, text fields, checkboxes, etc.)
2. Read the output to find the element you need — note its description or title
3. Call `affinity_click_ui` with the element's description/title and type (button, checkbox, text field, etc.)

### Draw Shapes and Objects

Use the tool selection + mouse action pattern:

1. Call `affinity_select_tool` with the desired tool (e.g., "rectangle", "ellipse", "pen")
2. Call `affinity_mouse_action` with `action: "drag"` and start/end coordinates to draw the shape
3. Call `affinity_screenshot` to verify the result

For the rectangle tool: drag defines the bounding box. For ellipse: drag defines the bounding ellipse. For pen: click to place anchor points.

### Add and Edit Text

1. Call `affinity_select_tool("text")` to activate the text tool
2. Call `affinity_mouse_action` with `action: "click"` at the desired position, or `action: "drag"` to create a text frame
3. Call `affinity_type_text` with the text content
4. Use `affinity_keystroke` for formatting shortcuts (Cmd+B for bold, Cmd+I for italic, etc.)

### Export a Document

1. Call `affinity_export` with the desired format (png, jpg, svg, pdf, etc.) — this opens the export dialog
2. Call `affinity_get_ui` to inspect the export dialog options
3. Call `affinity_click_ui` to set options (quality, area, etc.)
4. Call `affinity_click_ui` to click the final export/save button
5. Handle the file save dialog if it appears — use `affinity_get_ui` to inspect, `affinity_click_ui` or `affinity_type_text` to set the path

### Apply Filters

1. Call `affinity_filters` to list available filters under Pixel > Filters
2. Call `affinity_click_menu` with the filter path (e.g., `["Pixel", "Filters", "Blur", "Gaussian Blur…"]`)
3. Call `affinity_get_ui` to inspect the filter dialog
4. Call `affinity_click_ui` to adjust parameters and confirm

### Layer Operations

1. Call `affinity_add_layer` to add a new layer (pixel, mask, adjustment, live_filter, fill, pattern)
2. Use `affinity_click_menu` for layer operations available in the menu (merge, group, etc.)
3. Use `affinity_document_ops` for document-level operations (flatten, flip, rotate, clip/unclip canvas)

### Undo and Recovery

Call `affinity_undo_redo` with `action: "undo"` and a `times` count to step back. Use `action: "redo"` to step forward.

## The Visual Feedback Loop

Take screenshots liberally between steps. Call `affinity_screenshot` after every significant action to:

- Verify that the action had the intended effect
- Get screen coordinates for the next mouse action
- Understand the current state of dialogs and panels
- Identify errors or unexpected UI states

This is the single most important practice. Without screenshots, you are working blind.

## Tips and Best Practices

### Timing and Sleep

The tools include built-in sleep delays after actions, but some operations need extra time:

- After launching Affinity: wait before interacting (the tool handles this)
- After opening large files: take a screenshot to verify it loaded before proceeding
- After clicking menu items that open dialogs: call `affinity_get_ui` to confirm the dialog appeared

### Dialog Handling

Dialogs are modal — they block interaction with the rest of the app until dismissed:

- Always inspect dialogs with `affinity_get_ui` before interacting
- Use `affinity_click_ui` for buttons (OK, Cancel, Save, Don't Save)
- Use `affinity_key_code` with code 53 (Escape) to dismiss dialogs without saving
- Use `affinity_key_code` with code 36 (Return) to confirm the default action

### The PROCESS_NAME Quirk

The App Store version of Affinity registers as `"Affinity Affinity Store"` in System Events. If tools return errors about not finding the process, the user may need to update `PROCESS_NAME` in `index.ts` to match their installation (e.g., `"Affinity 2"` for non-App Store versions).

### Keyboard Shortcuts

Common shortcuts to use with `affinity_keystroke`:

- **Cmd+Z**: Undo | **Cmd+Shift+Z**: Redo
- **Cmd+A**: Select All | **Cmd+D**: Deselect
- **Cmd+C/V/X**: Copy/Paste/Cut
- **Cmd+G**: Group | **Cmd+Shift+G**: Ungroup
- **Cmd+N**: New Document | **Cmd+O**: Open | **Cmd+S**: Save
- **Cmd+Shift+S**: Save As | **Cmd+W**: Close

### Key Codes Reference

Use with `affinity_key_code`:

- **53**: Escape | **36**: Return | **51**: Delete | **48**: Tab
- **123**: Left Arrow | **124**: Right Arrow | **125**: Down Arrow | **126**: Up Arrow
- **49**: Space

## Reference Documentation

For complete tool API documentation with all parameters, types, and defaults, see [references/tool-reference.md](references/tool-reference.md).

For step-by-step workflow recipes, see [references/workflows.md](references/workflows.md).
