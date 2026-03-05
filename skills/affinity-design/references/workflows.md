# Affinity Workflow Recipes

Step-by-step recipes for common design tasks using the Affinity MCP tools.

---

## Recipe 1: Create a Blank Document and Add Text

**Goal:** Launch Affinity, create a new document, and add a text element.

### Steps

1. Check status and launch:
   ```
   affinity_status()
   affinity_launch()          // if not running
   ```

2. Create a new document:
   ```
   affinity_new_document()    // opens new document dialog
   ```

3. Handle the new document dialog:
   ```
   affinity_screenshot()      // see the dialog
   affinity_get_ui()          // inspect dialog elements
   affinity_click_ui({ elementDescription: "OK", elementType: "button" })
   ```

4. Add text:
   ```
   affinity_select_tool({ tool: "text" })
   affinity_mouse_action({ action: "drag", x: 200, y: 200, endX: 600, endY: 300 })
   affinity_type_text({ text: "Hello World" })
   ```

5. Verify:
   ```
   affinity_screenshot()
   ```

---

## Recipe 2: Open an Image and Apply a Filter

**Goal:** Open an existing image file and apply a Gaussian Blur filter.

### Steps

1. Open the image:
   ```
   affinity_open_file({ path: "/Users/me/photo.jpg" })
   affinity_screenshot()      // confirm it loaded
   ```

2. List available filters:
   ```
   affinity_filters()
   ```

3. Navigate to the blur filter:
   ```
   affinity_get_submenu({ menuName: "Pixel", submenuItem: "Filters" })
   ```

4. Apply Gaussian Blur:
   ```
   affinity_click_menu({ menuPath: ["Pixel", "Filters", "Blur", "Gaussian Blur…"] })
   ```

5. Adjust the filter dialog:
   ```
   affinity_get_ui()          // inspect the blur dialog
   affinity_screenshot()      // see the preview
   // Adjust radius if needed via UI elements
   affinity_click_ui({ elementDescription: "Apply", elementType: "button" })
   ```

6. Verify:
   ```
   affinity_screenshot()
   ```

---

## Recipe 3: Design a Simple Poster (Text + Shapes + Colors)

**Goal:** Create a poster with a colored rectangle background, title text, and subtitle.

### Steps

1. Start a session:
   ```
   affinity_status()
   affinity_launch()
   affinity_new_document()
   affinity_screenshot()      // see new document dialog
   affinity_get_ui()          // find OK/Create button
   affinity_click_ui({ elementDescription: "OK", elementType: "button" })
   ```

2. Draw a background rectangle:
   ```
   affinity_select_tool({ tool: "rectangle" })
   affinity_mouse_action({ action: "drag", x: 50, y: 50, endX: 750, endY: 1050 })
   affinity_screenshot()
   ```

3. Set the fill color (use the Color panel or menu):
   ```
   affinity_get_ui()          // find color controls
   // Interact with color panel elements as needed
   ```

4. Add title text:
   ```
   affinity_select_tool({ tool: "text" })
   affinity_mouse_action({ action: "drag", x: 100, y: 150, endX: 700, endY: 300 })
   affinity_type_text({ text: "My Poster Title" })
   ```

5. Format the title:
   ```
   affinity_keystroke({ key: "a", modifiers: ["command"] })   // Select All text
   affinity_keystroke({ key: "b", modifiers: ["command"] })   // Bold
   ```

6. Add subtitle:
   ```
   affinity_select_tool({ tool: "text" })
   affinity_mouse_action({ action: "drag", x: 100, y: 350, endX: 700, endY: 450 })
   affinity_type_text({ text: "A subtitle goes here" })
   ```

7. Verify:
   ```
   affinity_screenshot()
   ```

---

## Recipe 4: Export a Document as PNG

**Goal:** Export the current document as a PNG file.

### Steps

1. Open the export dialog:
   ```
   affinity_export({ format: "png" })
   ```

2. Inspect the export dialog:
   ```
   affinity_get_ui()
   affinity_screenshot()
   ```

3. Click the export button in the dialog:
   ```
   affinity_click_ui({ elementDescription: "Export", elementType: "button" })
   ```

4. Handle the file save dialog:
   ```
   affinity_get_ui()          // inspect save dialog
   affinity_screenshot()
   // Type the filename if a text field is focused
   affinity_type_text({ text: "my-export" })
   affinity_key_code({ code: 36 })  // Return to confirm
   ```

5. Verify the export completed:
   ```
   affinity_screenshot()
   ```

---

## Recipe 5: Export a Document as PDF

**Goal:** Export the current document as a PDF file.

### Steps

1. Open the export dialog for PDF:
   ```
   affinity_export({ format: "pdf" })
   ```

2. Inspect and configure:
   ```
   affinity_get_ui()
   affinity_screenshot()
   ```

3. Export:
   ```
   affinity_click_ui({ elementDescription: "Export", elementType: "button" })
   ```

4. Handle the save dialog as in Recipe 4.

---

## Recipe 6: Navigate and Use the Menu System

**Goal:** Explore Affinity's menus to find and use a specific feature.

### Steps

1. List top-level menu items:
   ```
   affinity_get_menus({ menuName: "File" })
   affinity_get_menus({ menuName: "Edit" })
   affinity_get_menus({ menuName: "Document" })
   affinity_get_menus({ menuName: "Pixel" })
   ```

2. Explore submenus:
   ```
   affinity_get_submenu({ menuName: "File", submenuItem: "Export" })
   affinity_get_submenu({ menuName: "Pixel", submenuItem: "Filters" })
   ```

3. Click the desired menu item:
   ```
   affinity_click_menu({ menuPath: ["Document", "Flatten"] })
   ```

4. Verify:
   ```
   affinity_screenshot()
   ```

---

## Recipe 7: Handle Dialogs (Export, Save, Preferences)

**Goal:** Interact with modal dialogs that appear in Affinity.

### General Dialog Pattern

1. A dialog appears (from export, save, filter, or menu action).

2. Inspect it:
   ```
   affinity_get_ui()
   affinity_screenshot()
   ```

3. Interact with dialog elements:
   ```
   // Click buttons
   affinity_click_ui({ elementDescription: "OK", elementType: "button" })

   // Toggle checkboxes
   affinity_click_ui({ elementDescription: "Embed ICC Profile", elementType: "checkbox" })

   // Select from dropdowns
   affinity_click_ui({ elementDescription: "Quality", elementType: "pop up button" })

   // Type in text fields
   affinity_click_ui({ elementDescription: "Width", elementType: "text field" })
   affinity_type_text({ text: "1920" })
   ```

4. Confirm or cancel:
   ```
   affinity_click_ui({ elementDescription: "OK", elementType: "button" })
   // or
   affinity_key_code({ code: 53 })  // Escape to cancel
   ```

### Save Dialog Pattern

When a save dialog appears (e.g., from Cmd+Shift+S):

```
affinity_save({ saveAs: true, path: "/Users/me/output/poster.afdesign" })
```

The tool handles navigating the Go To dialog, typing the path, and clicking Save.

### "Don't Save" Pattern

When closing a document with unsaved changes:

```
affinity_close_document({ save: false })
```

The tool automatically clicks "Don't Save" if the dialog appears.
