(function () {
  const TEMPLATE = [
    "#include <bits/stdc++.h>",
    "using namespace std;",
    "",
    "int main() {",
    "    ios::sync_with_stdio(false);",
    "    cin.tie(nullptr);",
    "",
    "    int n;",
    "    cin >> n;",
    "    cout << n * n << '\\n';",
    "    return 0;",
    "}",
  ].join("\n");

  let editorInstance = null;

  function isGerman() {
    return (document.documentElement.lang || "en")
      .toLowerCase()
      .startsWith("de");
  }

  function tr(en, de) {
    return isGerman() ? de : en;
  }

  function setStatus(text) {
    const el = document.getElementById("cpp-status");
    if (el) el.textContent = text;
  }

  function setSaveStatus(text) {
    const el = document.getElementById("cpp-save-status");
    if (el) el.textContent = text;
  }

  function analyzeCode(code) {
    const hasMain = /int\s+main\s*\(/.test(code);
    const hasInclude = /#include\s*</.test(code);
    if (!hasMain) return tr("Missing main()", "main() fehlt");
    if (!hasInclude) {
      return tr(
        "No include directive found",
        "Keine include-Direktive gefunden",
      );
    }
    return tr(
      "Looks valid for prototype checks",
      "Sieht für Prototyp-Checks gültig aus",
    );
  }

  function submitCpp() {
    const team = (document.getElementById("cpp-team").value || "").trim();
    const game = document.getElementById("cpp-game").value;
    const standard = document.getElementById("cpp-standard").value;
    const code = editorInstance.getValue().trim();

    if (!team || !code) {
      setSaveStatus(
        tr(
          "Team name and C++ code are required",
          "Team-Name und C++-Code sind erforderlich",
        ),
      );
      return;
    }

    const checks = analyzeCode(code);
    setStatus(tr("Static check: ", "Statischer Check: ") + checks);

    window.MathathonStore.addSubmission("cpp", {
      team,
      game,
      standard,
      code,
      language: "C++",
      submittedAt: new Date().toISOString(),
    });

    setSaveStatus(
      tr("C++ submission saved locally", "C++-Einreichung lokal gespeichert"),
    );
  }

  async function loadFileIntoEditor(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const text = await file.text();
    editorInstance.setValue(text);
    setStatus(tr("Loaded file: ", "Datei geladen: ") + file.name);
  }

  async function bootstrap() {
    const editorRoot = document.getElementById("cpp-editor-root");
    const { editor } = await window.createMathathonEditor({
      container: editorRoot,
      language: "cpp",
      value: TEMPLATE,
    });
    editorInstance = editor;

    document.getElementById("submit-cpp").addEventListener("click", submitCpp);
    document.getElementById("cpp-reset").addEventListener("click", () => {
      editorInstance.setValue(TEMPLATE);
      setStatus(tr("Editor reset", "Editor zurueckgesetzt"));
    });
    document
      .getElementById("cpp-file")
      .addEventListener("change", loadFileIntoEditor);

    setStatus(
      tr(
        "Editor ready with syntax highlighting and autocomplete",
        "Editor bereit mit Syntax-Highlighting und Autovervollständigung",
      ),
    );
    setSaveStatus(tr("No submission yet", "Noch keine Einreichung"));
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();

