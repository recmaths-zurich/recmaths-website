(function () {
  const MONACO_BASE = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min";
  const RECMATHS = {
    limeLight: "#90e979",
    lime: "#62db3d",
    teal: "#18556d",
    purple: "#c22ff1",
    deepNavy: "#201131",
    blue: "#4273b5",
    blueDark: "#223759",
    night: "#080d15",
    nearBlack: "#020305",
  };
  let monacoReadyPromise = null;
  let providersRegistered = false;

  function defineThemes(monaco) {
    monaco.editor.defineTheme("mathathon-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6f7888", fontStyle: "italic" },
        { token: "keyword", foreground: "18556d", fontStyle: "bold" },
        { token: "keyword.control", foreground: "223759", fontStyle: "bold" },
        { token: "entity.name.function", foreground: "4273b5" },
        { token: "entity.name.class", foreground: "201131", fontStyle: "bold" },
        { token: "variable", foreground: "201131" },
        { token: "string", foreground: "18556d" },
        { token: "string.escape", foreground: "c22ff1" },
        { token: "number", foreground: "c22ff1" },
        { token: "constant.language", foreground: "223759", fontStyle: "bold" },
        { token: "type.identifier", foreground: "4273b5", fontStyle: "bold" },
        { token: "delimiter", foreground: "223759" },
      ],
      colors: {
        "editor.background": "#f8fbff",
        "editor.foreground": RECMATHS.deepNavy,
        "editorLineNumber.foreground": "#8ba0b4",
        "editorLineNumber.activeForeground": RECMATHS.blueDark,
        "editor.lineHighlightBackground": "#edf4fb",
        "editorCursor.foreground": RECMATHS.purple,
        "editor.selectionBackground": "#d8e7fb",
        "editor.inactiveSelectionBackground": "#eaf2fd",
        "editorIndentGuide.background1": "#dde7f2",
        "editorIndentGuide.activeBackground1": RECMATHS.blue,
        "editorBracketMatch.background": "#d8f8cf88",
        "editorBracketMatch.border": RECMATHS.lime,
        "editorBracketHighlight.foreground1": RECMATHS.limeLight,
        "editorBracketHighlight.foreground2": RECMATHS.lime,
        "editorBracketHighlight.foreground3": RECMATHS.teal,
        "editorBracketHighlight.foreground4": RECMATHS.purple,
        "editorBracketHighlight.foreground5": RECMATHS.deepNavy,
        "editorBracketHighlight.foreground6": RECMATHS.blue,
        "editor.findMatchBackground": "#62db3d66",
        "editor.findMatchHighlightBackground": "#18556d44",
      },
    });

    monaco.editor.defineTheme("mathathon-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "7d8a9f", fontStyle: "italic" },
        { token: "keyword", foreground: "62db3d", fontStyle: "bold" },
        { token: "keyword.control", foreground: "90e979", fontStyle: "bold" },
        { token: "entity.name.function", foreground: "4273b5" },
        { token: "entity.name.class", foreground: "c22ff1", fontStyle: "bold" },
        { token: "variable", foreground: "d7e3f5" },
        { token: "string", foreground: "90e979" },
        { token: "string.escape", foreground: "c22ff1" },
        { token: "number", foreground: "c22ff1" },
        { token: "constant.language", foreground: "62db3d", fontStyle: "bold" },
        { token: "type.identifier", foreground: "4273b5", fontStyle: "bold" },
        { token: "delimiter", foreground: "a9bdd8" },
      ],
      colors: {
        "editor.background": RECMATHS.night,
        "editor.foreground": "#dbe6f7",
        "editorLineNumber.foreground": "#5f6f86",
        "editorLineNumber.activeForeground": RECMATHS.limeLight,
        "editor.lineHighlightBackground": "#141d2b",
        "editorCursor.foreground": RECMATHS.purple,
        "editor.selectionBackground": "#274a6f88",
        "editor.inactiveSelectionBackground": "#22375966",
        "editorIndentGuide.background1": "#1d2a3f",
        "editorIndentGuide.activeBackground1": RECMATHS.blue,
        "editorBracketMatch.background": "#62db3d22",
        "editorBracketMatch.border": RECMATHS.limeLight,
        "editorBracketHighlight.foreground1": RECMATHS.limeLight,
        "editorBracketHighlight.foreground2": RECMATHS.lime,
        "editorBracketHighlight.foreground3": RECMATHS.teal,
        "editorBracketHighlight.foreground4": RECMATHS.purple,
        "editorBracketHighlight.foreground5": RECMATHS.deepNavy,
        "editorBracketHighlight.foreground6": RECMATHS.blue,
        "editor.findMatchBackground": "#62db3d55",
        "editor.findMatchHighlightBackground": "#18556d55",
      },
    });
  }

  function activeTheme() {
    return document.body.dataset.style === "dark"
      ? "mathathon-dark"
      : "mathathon-light";
  }

  function collectWordSuggestions(model, monaco, language) {
    const text = model.getValue();
    const words = new Set(text.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []);
    return Array.from(words)
      .filter((word) => word.length >= 3)
      .slice(0, 240)
      .map((word) => ({
        label: word,
        detail: `${language} symbol`,
        kind: monaco.languages.CompletionItemKind.Variable,
        insertText: word,
        documentation: "From current editor content",
      }));
  }

  function registerCompletion(monaco, language, entries) {
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: [".", "_", "(", " ", "#", ":"],
      provideCompletionItems(model, position) {
        const wordInfo = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: wordInfo.startColumn,
          endColumn: wordInfo.endColumn,
        };
        const staticSuggestions = entries.map((entry) => ({
          label: entry.label,
          detail: entry.detail,
          kind: entry.kind || monaco.languages.CompletionItemKind.Snippet,
          insertText: entry.insertText,
          insertTextRules: entry.snippet
            ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            : undefined,
          documentation: entry.documentation,
          range,
        }));
        const wordSuggestions = collectWordSuggestions(
          model,
          monaco,
          language,
        ).map((entry) => ({
          ...entry,
          range,
        }));
        return {
          suggestions: [...staticSuggestions, ...wordSuggestions],
        };
      },
    });
  }

  function registerProviders(monaco) {
    if (providersRegistered) return;

    registerCompletion(monaco, "python", [
      {
        label: "solve-template",
        detail: "Input/output function template",
        insertText:
          "def solve():\n    ${1:n} = int(input().strip())\n    ${2:print(n)}\n\nif __name__ == '__main__':\n    solve()",
        documentation: "Basic Mathathon solve() structure",
        snippet: true,
      },
      {
        label: "for-range",
        detail: "for loop with range",
        insertText: "for ${1:i} in range(${2:n}):\n    ${3:pass}",
        documentation: "Python loop skeleton",
        snippet: true,
      },
      {
        label: "list-comp",
        detail: "List comprehension",
        insertText: "${1:arr} = [${2:expr} for ${3:x} in ${4:iterable}]",
        documentation: "Quick list construction",
        snippet: true,
      },
      {
        label: "print",
        detail: "Python built-in",
        insertText: "print(${1:value})",
        documentation: "Print value to stdout",
        kind: monaco.languages.CompletionItemKind.Function,
        snippet: true,
      },
      {
        label: "enumerate",
        detail: "Python built-in",
        insertText: "enumerate(${1:iterable})",
        documentation: "Iterate with index and value",
        kind: monaco.languages.CompletionItemKind.Function,
        snippet: true,
      },
      {
        label: "def",
        detail: "Python keyword",
        insertText: "def ${1:name}(${2:args}):\n    ${3:pass}",
        documentation: "Function definition",
        kind: monaco.languages.CompletionItemKind.Keyword,
        snippet: true,
      },
      {
        label: "class",
        detail: "Python keyword",
        insertText:
          "class ${1:Name}:\n    def __init__(self, ${2:args}):\n        ${3:pass}",
        documentation: "Class skeleton",
        kind: monaco.languages.CompletionItemKind.Keyword,
        snippet: true,
      },
      {
        label: "import",
        detail: "Python keyword",
        insertText: "import ${1:module}",
        documentation: "Import module",
        kind: monaco.languages.CompletionItemKind.Keyword,
        snippet: true,
      },
    ]);

    registerCompletion(monaco, "cpp", [
      {
        label: "cpp-main",
        detail: "Fast I/O main function",
        insertText:
          "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    ${1:// code}\n    return 0;\n}",
        documentation: "Competitive programming C++ skeleton",
        snippet: true,
      },
      {
        label: "for-loop",
        detail: "Classic for loop",
        insertText:
          "for (int ${1:i} = 0; ${1:i} < ${2:n}; ++${1:i}) {\n    ${3:// code}\n}",
        documentation: "Index-based loop",
        snippet: true,
      },
      {
        label: "vector-int",
        detail: "vector<int> declaration",
        insertText: "vector<int> ${1:values}(${2:n});",
        documentation: "Integer vector",
        snippet: true,
      },
      {
        label: "if",
        detail: "C++ keyword",
        insertText: "if (${1:condition}) {\n    ${2:// code}\n}",
        documentation: "if block",
        kind: monaco.languages.CompletionItemKind.Keyword,
        snippet: true,
      },
      {
        label: "while",
        detail: "C++ keyword",
        insertText: "while (${1:condition}) {\n    ${2:// code}\n}",
        documentation: "while loop",
        kind: monaco.languages.CompletionItemKind.Keyword,
        snippet: true,
      },
      {
        label: "cout",
        detail: "C++ stream",
        insertText: "cout << ${1:value} << '\\n';",
        documentation: "Write line to stdout",
        kind: monaco.languages.CompletionItemKind.Function,
        snippet: true,
      },
      {
        label: "cin",
        detail: "C++ stream",
        insertText: "cin >> ${1:value};",
        documentation: "Read value from stdin",
        kind: monaco.languages.CompletionItemKind.Function,
        snippet: true,
      },
      {
        label: "sort",
        detail: "STL algorithm",
        insertText: "sort(${1:arr}.begin(), ${1:arr}.end());",
        documentation: "Sort container",
        kind: monaco.languages.CompletionItemKind.Function,
        snippet: true,
      },
    ]);

    providersRegistered = true;
  }

  function loadMonaco() {
    if (monacoReadyPromise) return monacoReadyPromise;

    monacoReadyPromise = new Promise((resolve, reject) => {
      if (window.monaco && window.monaco.editor) {
        resolve(window.monaco);
        return;
      }

      const workerScript = `self.MonacoEnvironment = { baseUrl: '${MONACO_BASE}/' }; importScripts('${MONACO_BASE}/vs/base/worker/workerMain.js');`;
      const workerBlob = new Blob([workerScript], { type: "text/javascript" });
      const workerUrl = URL.createObjectURL(workerBlob);
      window.MonacoEnvironment = {
        getWorkerUrl() {
          return workerUrl;
        },
      };

      const loader = document.createElement("script");
      loader.src = MONACO_BASE + "/vs/loader.min.js";
      loader.async = true;
      loader.onload = () => {
        window.require.config({ paths: { vs: MONACO_BASE + "/vs" } });
        window.require(
          ["vs/editor/editor.main"],
          () => {
            const monaco = window.monaco;
            defineThemes(monaco);
            monaco.editor.setTheme(activeTheme());
            registerProviders(monaco);
            resolve(monaco);
          },
          reject,
        );
      };
      loader.onerror = reject;
      document.head.appendChild(loader);
    });

    return monacoReadyPromise;
  }

  window.createMathathonEditor = async function createMathathonEditor(options) {
    const monaco = await loadMonaco();
    const editor = monaco.editor.create(options.container, {
      value: options.value || "",
      language: options.language || "python",
      automaticLayout: true,
      minimap: { enabled: true },
      fontSize: 14,
      lineHeight: 22,
      padding: { top: 0, bottom: 0 },
      roundedSelection: true,
      scrollBeyondLastLine: false,
      wordWrap: "on",
      quickSuggestions: true,
      wordBasedSuggestions: "allDocuments",
      snippetSuggestions: "inline",
      suggestSelection: "first",
      suggestOnTriggerCharacters: true,
      tabCompletion: "on",
      acceptSuggestionOnEnter: "on",
      suggest: {
        showSnippets: true,
        showFunctions: true,
        showVariables: true,
        showKeywords: true,
      },
      tabSize: 4,
      insertSpaces: true,
      bracketPairColorization: { enabled: true },
    });
    editor.updateOptions({ padding: { top: 0, bottom: 0 } });

    const layoutToContainer = () => {
      const rect = options.container.getBoundingClientRect();
      const width = Math.max(0, Math.floor(rect.width));
      const height = Math.max(0, Math.floor(rect.height));
      if (width > 0 && height > 0) {
        editor.layout({ width, height });
      } else {
        editor.layout();
      }
    };

    const resizeObserver = new ResizeObserver(layoutToContainer);
    resizeObserver.observe(options.container);
    requestAnimationFrame(layoutToContainer);
    setTimeout(layoutToContainer, 0);
    setTimeout(layoutToContainer, 120);

    const listener = () => monaco.editor.setTheme(activeTheme());
    window.addEventListener("mathathon-theme-changed", listener);
    editor.onDidDispose(() => {
      resizeObserver.disconnect();
      window.removeEventListener("mathathon-theme-changed", listener);
    });

    return { monaco, editor };
  };
})();
