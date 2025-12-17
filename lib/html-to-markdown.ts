import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  // Preserve whitespace in code blocks
  codeBlockStyle: "fenced",
});

// Configure turndown to preserve formatting
turndownService.addRule("strikethrough", {
  filter: (node) => {
    return (
      node.nodeName === "DEL" ||
      node.nodeName === "S" ||
      node.nodeName === "STRIKE"
    );
  },
  replacement: (content) => `~~${content}~~`,
});

// Preserve whitespace in pre elements and code blocks
turndownService.addRule("pre", {
  filter: "pre",
  replacement: (content) => {
    return "\n```\n" + content + "\n```\n";
  },
});

// Add rule to handle pre elements that preserve whitespace
turndownService.addRule("preformatted", {
  filter: (node) => {
    return node.nodeName === "PRE" && node.parentNode?.nodeName !== "CODE";
  },
  replacement: (content) => {
    // Preserve whitespace in pre blocks
    return "\n```\n" + content + "\n```\n";
  },
});

// Helper function to convert leading spaces to &nbsp;
function convertLeadingSpacesToNbsp(text: string): string {
  return text.replace(/^(\s+)/, (match) => {
    return match.replace(/ /g, "&nbsp;").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  });
}

// Helper function to convert all spaces in indentation to &nbsp;
function convertIndentToNbsp(text: string): string {
  // Match leading whitespace (spaces and tabs) and convert to &nbsp;
  return text.replace(/^(\s+)/, (match) => {
    return match.replace(/ /g, "&nbsp;").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  });
}

// Convert TipTap JSON node to markdown, preserving whitespace
function jsonToMarkdown(node: any, listIndent: number = 0): string {
  if (!node) return "";

  if (typeof node === "string") return node;
  if (Array.isArray(node)) {
    return node.map((item) => jsonToMarkdown(item, listIndent)).join("");
  }

  const type = node.type || "";
  const content = node.content || [];

  switch (type) {
    case "doc":
      return content.map((item: any) => jsonToMarkdown(item, 0)).join("");

    case "paragraph":
      const paraContent = content.map((c: any) => jsonToMarkdown(c, listIndent)).join("");
      // Convert leading spaces to &nbsp;
      const paraWithNbsp = convertIndentToNbsp(paraContent);
      // End paragraphs with \n\n (normal markdown paragraph break)
      return paraWithNbsp + "\n\n";

    case "heading":
      const level = node.attrs?.level || 1;
      const headingContent = content.map((c: any) => jsonToMarkdown(c, listIndent)).join("");
      return "#".repeat(level) + " " + headingContent + "\n\n";

    case "bulletList":
      // Handle nested lists with proper indentation (2 spaces per level)
      const bulletIndent = "  ".repeat(listIndent);
      const bulletItems = content.map((item: any) => {
        const itemContent = jsonToMarkdown(item, listIndent);
        // Don't trim - preserve indentation structure from nested lists
        // Split by newlines and process each line
        const lines = itemContent.split("\n");
        return lines.map((line, idx) => {
          if (idx === 0) {
            // First line (the list item marker) - add base indentation
            // Remove any existing leading whitespace first
            return bulletIndent + line.trimStart();
          }
          // Subsequent lines - preserve their indentation structure
          if (!line.trim()) {
            // Empty line - preserve it
            return line;
          }
          // Check if this line is a list marker (nested list)
          // Check the original line first to see if it has indentation
          if (/^\s+([-*]|\d+\.)\s/.test(line)) {
            // This line already has indentation and a list marker (nested list)
            // Add base indentation to the existing indentation
            return bulletIndent + line;
          } else if (/^([-*]|\d+\.)\s/.test(line.trim())) {
            // This is a list marker but no existing indentation
            // Add base indentation
            return bulletIndent + line.trim();
          } else {
            // Regular content line - indent it with extra spaces
            return bulletIndent + "  " + line.trimStart();
          }
        }).join("\n");
      }).filter(item => item.trim()).join("\n"); // Join with single newline, no blank lines
      return bulletItems + "\n";

    case "orderedList":
      // Handle nested lists with proper indentation
      const orderedIndent = "  ".repeat(listIndent);
      const orderedItems = content.map((item: any, i: number) => {
        const itemContent = jsonToMarkdown(item, listIndent);
        // Don't trim - preserve indentation structure from nested lists
        // Split by newlines and process each line
        const lines = itemContent.split("\n");
        return lines.map((line, idx) => {
          if (idx === 0) {
            // First line (the list item marker) - replace "- " with numbered prefix and add base indentation
            const trimmedFirst = line.trimStart();
            const numberedFirst = trimmedFirst.replace(/^-\s+/, `${i + 1}. `);
            return orderedIndent + numberedFirst;
          }
          // Subsequent lines - preserve their indentation structure
          if (!line.trim()) {
            // Empty line - preserve it
            return line;
          }
          // Check if this line is a list marker (nested list)
          // Check the original line first to see if it has indentation
          if (/^\s+([-*]|\d+\.)\s/.test(line)) {
            // This line already has indentation and a list marker (nested list)
            // Add base indentation to the existing indentation
            return orderedIndent + line;
          } else if (/^([-*]|\d+\.)\s/.test(line.trim())) {
            // This is a list marker but no existing indentation
            // Add base indentation
            return orderedIndent + line.trim();
          } else {
            // Regular content line - indent it with extra spaces
            return orderedIndent + "  " + line.trimStart();
          }
        }).join("\n");
      }).filter(item => item.trim()).join("\n"); // Join with single newline, no blank lines
      return orderedItems + "\n";

    case "listItem":
      // List items can contain paragraphs, nested lists, etc.
      let itemParts: string[] = [];
      let hasNestedList = false;
      
      for (const child of content) {
        if (child.type === "bulletList" || child.type === "orderedList") {
          // Nested list - process with increased indent and put on new line
          hasNestedList = true;
          const nestedContent = jsonToMarkdown(child, listIndent + 1);
          // Nested lists should be on a new line with proper indentation
          // Remove only trailing newlines, preserve leading indentation
          const trimmedNested = nestedContent.replace(/\n+$/, "");
          itemParts.push("\n" + trimmedNested);
        } else if (child.type === "paragraph") {
          // Paragraphs in list items should be inline (no double newline)
          const paraContent = jsonToMarkdown(child, listIndent);
          // Remove all trailing newlines from paragraphs in list items
          const inlineContent = paraContent.replace(/\n+$/, "").trim();
          if (inlineContent) {
            itemParts.push(inlineContent);
          }
        } else {
          const childContent = jsonToMarkdown(child, listIndent);
          // Remove trailing newlines
          const trimmed = childContent.replace(/\n+$/, "").trim();
          if (trimmed) {
            itemParts.push(trimmed);
          }
        }
      }
      
      // Join parts: use space for inline content, newline for nested lists
      // Don't trim - preserve indentation from nested lists
      let itemContent = itemParts.join(hasNestedList ? "\n" : " ");
      // Remove only trailing whitespace, not leading
      itemContent = itemContent.replace(/\s+$/, "");
      // Add bullet point prefix (orderedList will replace this)
      // Don't add trailing newline - let the parent list handle spacing
      return "- " + itemContent;

    case "text":
      return node.text || "";

    case "hardBreak":
      // Hard breaks within content should be <br>
      return "<br>";

    case "bold":
      return "**" + content.map((c: any) => jsonToMarkdown(c, listIndent)).join("") + "**";

    case "italic":
      return "*" + content.map((c: any) => jsonToMarkdown(c, listIndent)).join("") + "*";

    default:
      return content.map((c: any) => jsonToMarkdown(c, listIndent)).join("");
  }
}

export function htmlToMarkdown(html: string): string {
  // Extract TipTap JSON if present (for whitespace preservation)
  const jsonMatch = html.match(/<!-- TIPTAP_JSON:(.+?) -->/);

  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[1]);
      // Convert JSON to markdown, preserving whitespace
      let markdown = jsonToMarkdown(json);
      
      // Convert multiple consecutive paragraph breaks (\n\n\n+) to <br> tags (gaps)
      // But preserve single paragraph breaks (\n\n) as normal markdown
      // Pattern: \n\n\n+ means 3+ newlines (normal break + extra = gap)
      markdown = markdown.replace(/\n\n(\n+)/g, (match, extraNewlines) => {
        // extraNewlines contains the newlines beyond the first \n\n
        // Each pair of newlines (\n\n) beyond the first becomes a <br>
        const gapCount = Math.floor(extraNewlines.length / 2);
        return "\n\n" + "<br>".repeat(gapCount) + (extraNewlines.length % 2 === 1 ? "\n" : "");
      });
      
      // Convert any remaining tabs to &nbsp; (4 &nbsp; per tab)
      markdown = markdown.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
      
      // Convert leading spaces in lines to &nbsp;
      // But skip lines that start with list markers (they need to stay as-is for markdown)
      // Also skip lines that have list markers after leading spaces (nested lists)
      markdown = markdown.split("\n").map(line => {
        // Skip lines that start with list markers (even with leading spaces for nested lists)
        // This regex matches: optional leading whitespace, then list marker (-, *, or number.), then space
        if (/^(\s*)([-*]|\d+\.)\s/.test(line)) {
          return line;
        }
        // Also skip empty lines
        if (!line.trim()) {
          return line;
        }
        // Only convert leading spaces on non-list lines
        return convertIndentToNbsp(line);
      }).join("\n");
      
      // Don't trim - preserve leading/trailing whitespace
      return markdown;
    } catch (e) {
      console.error("Failed to parse TipTap JSON:", e);
      // Fall through to regular HTML conversion
    }
  }

  // Regular HTML to markdown conversion (fallback)
  let markdown = turndownService.turndown(
    html.replace(/<!-- TIPTAP_.*? -->/, "")
  );
  // Convert tabs to &nbsp;
  markdown = markdown.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
  // Convert multiple consecutive paragraph breaks to <br> (gaps)
  markdown = markdown.replace(/\n\n(\n+)/g, (match, extraNewlines) => {
    const gapCount = Math.floor(extraNewlines.length / 2);
    return "\n\n" + "<br>".repeat(gapCount) + (extraNewlines.length % 2 === 1 ? "\n" : "");
  });
  // Convert leading spaces to &nbsp;
  // But skip lines that start with list markers
  markdown = markdown.split("\n").map(line => {
    // Skip lines that start with list markers
    if (/^(\s*)([-*]|\d+\.)\s/.test(line)) {
      return line;
    }
    return convertIndentToNbsp(line);
  }).join("\n");
  return markdown;
}
