/**
 * SQL Editor Component using Monaco Editor
 */

import { useRef, useCallback } from 'react';
import Editor, { type OnMount, useMonaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import type { editor } from 'monaco-editor';

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute?: () => void;
  height?: string;
  readOnly?: boolean;
  placeholder?: string;
}

export function SqlEditor({
  value,
  onChange,
  onExecute,
  height = '300px',
  readOnly = false,
}: SqlEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monaco = useMonaco();

  // Configure Monaco for SQL
  useEffect(() => {
    if (monaco) {
      // Set SQL language configuration
      monaco.languages.setLanguageConfiguration('sql', {
        comments: {
          lineComment: '--',
          blockComment: ['/*', '*/'],
        },
        brackets: [
          ['(', ')'],
          ['[', ']'],
        ],
        autoClosingPairs: [
          { open: '(', close: ')' },
          { open: '[', close: ']' },
          { open: "'", close: "'", notIn: ['string'] },
          { open: '"', close: '"', notIn: ['string'] },
        ],
      });

      // Define custom dark theme for SQL
      monaco.editor.defineTheme('sql-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
          { token: 'string.sql', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'predefined', foreground: '4EC9B0' },
        ],
        colors: {
          'editor.background': '#0D1117',
          'editor.foreground': '#E6EDF3',
          'editorLineNumber.foreground': '#484F58',
          'editorLineNumber.activeForeground': '#E6EDF3',
          'editor.selectionBackground': '#264F78',
          'editor.lineHighlightBackground': '#161B22',
          'editorCursor.foreground': '#58A6FF',
          'editorWhitespace.foreground': '#484F58',
        },
      });

      // Set the theme on the current editor instance if it exists
      if (editorRef.current) {
        editorRef.current.updateOptions({ theme: 'sql-dark' });
      }

      // Set the default theme for all new editor instances
      monaco.editor.setTheme('sql-dark');
    }
  }, [monaco]);

  const handleEditorDidMount: OnMount = useCallback(
    (editor, monacoInstance) => {
      editorRef.current = editor;

      // Focus editor
      editor.focus();

      // Add Ctrl+Enter shortcut to execute
      if (onExecute) {
        editor.addCommand(
          monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter,
          () => {
            onExecute();
          }
        );
      }

      // Configure editor options
      editor.updateOptions({
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
        fontLigatures: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        lineNumbers: 'on',
        renderLineHighlight: 'line',
        tabSize: 2,
        wordWrap: 'on',
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        smoothScrolling: true,
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
      });
    },
    [onExecute]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      onChange(value || '');
    },
    [onChange]
  );

  return (
    <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#0D1117]">
      <Editor
        height={height}
        defaultLanguage="sql"
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="sql-dark"
        loading={
          <div className="flex items-center justify-center h-full bg-[#0D1117] text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
              <span>Đang tải...</span>
            </div>
          </div>
        }
        options={{
          readOnly,
          domReadOnly: readOnly,
        }}
      />
      {onExecute && (
        <div className="absolute bottom-3 right-3 text-xs text-zinc-500 bg-zinc-800/80 px-2 py-1 rounded">
          Bấm <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300 font-mono">Ctrl</kbd>+
          <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-300 font-mono">Enter</kbd> để chạy
        </div>
      )}
    </div>
  );
}
