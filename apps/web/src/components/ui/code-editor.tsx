"use client";

import MonacoEditor, { type EditorProps } from "@monaco-editor/react";
import { useTheme } from "next-themes";

const CODE_EDITOR_OPTIONS: EditorProps["options"] = {
  minimap: { enabled: false },
  lineNumbers: "on",
  scrollBeyondLastLine: false,
  fontSize: 12,
  wordWrap: "on",
  autoClosingBrackets: "always",
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
  autoIndent: "full",
  autoIndentOnPaste: true,
  contextmenu: false,
  cursorSmoothCaretAnimation: "on",
  suggestOnTriggerCharacters: false,
  wordBasedSuggestions: "off",
  quickSuggestions: false,
  glyphMargin: false,
  lineDecorationsWidth: 0,
  padding: { bottom: 3, top: 3 },
} as const;

export function CodeEditor(props: EditorProps) {
  const { resolvedTheme } = useTheme();

  return (
    <MonacoEditor
      {...props}
      language={props.language || "json"}
      height={props.height || "100px"}
      options={{ ...CODE_EDITOR_OPTIONS, ...props.options }}
      theme={resolvedTheme === "dark" ? "vs-dark" : "light"}
    />
  );
}
