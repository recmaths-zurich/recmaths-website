(function () {
  const TEMPLATE = [
    "n = int(input().strip())",
    "ans = 1",
    "for i in range(2, n + 1):",
    "    ans *= i",
    "print(ans)",
  ].join("\n");

  const PYODIDE_INDEX = "https://cdn.jsdelivr.net/pyodide/v0.27.5/full/";
  const EXEC_TIMEOUT_MS = 1000;

  let editorInstance = null;
  let workerState = null;
  let messageSeq = 0;

  function isGerman() {
    return (document.documentElement.lang || "en")
      .toLowerCase()
      .startsWith("de");
  }

  function tr(en, de) {
    return isGerman() ? de : en;
  }

  function setStatus(text) {
    const el = document.getElementById("runtime-status");
    if (el) el.textContent = text;
  }

  function setSaveStatus(text) {
    const el = document.getElementById("save-status");
    if (el) el.textContent = text;
  }

  function setOutput(text) {
    const el = document.getElementById("python-output");
    if (el) el.textContent = text;
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function setOutputSegments(segments) {
    const el = document.getElementById("python-output");
    if (!el) return;

    const html = segments
      .filter((segment) => segment && segment.text)
      .map((segment) =>
        segment.isError
          ? `<span class="stream-error">${escapeHtml(segment.text)}</span>`
          : `<span>${escapeHtml(segment.text)}</span>`,
      )
      .join("\n\n");

    el.innerHTML = html;
  }

  function setRunState(isRunning) {
    const indicator = document.getElementById("python-run-indicator");
    if (indicator) indicator.hidden = !isRunning;

    const outputPanel = document.querySelector(".output-panel");
    if (outputPanel) outputPanel.classList.toggle("is-running", isRunning);

    [
      "run-python",
      "run-python-inline",
      "test-python",
      "submit-python",
      "reset-python",
    ].forEach((id) => {
      const button = document.getElementById(id);
      if (button) button.disabled = isRunning;
    });
  }

  function parseTests() {
    const raw = document.getElementById("python-tests").value || "";
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("=>");
        return {
          input: (parts[0] || "").trim(),
          expected: (parts[1] || "").trim(),
        };
      })
      .filter((item) => item.input || item.expected);
  }

  function workerSource() {
    return `
let pyodideReadyPromise = null;
const PYODIDE_INDEX = ${JSON.stringify(PYODIDE_INDEX)};

async function getPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = (async () => {
      importScripts(PYODIDE_INDEX + "pyodide.js");
      return await loadPyodide({ indexURL: PYODIDE_INDEX });
    })();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const msg = event.data || {};

  if (msg.type === "init") {
    try {
      await getPyodide();
      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({ type: "fatal", error: String(error && error.message ? error.message : error) });
    }
    return;
  }

  if (msg.type === "execute") {
    try {
      const pyodide = await getPyodide();
      pyodide.globals.set("USER_CODE", msg.code || "");
      pyodide.globals.set("USER_STDIN", msg.stdin || "");

      await pyodide.runPythonAsync(\`
import io
import sys
import traceback

_stdout = io.StringIO()
_stderr = io.StringIO()
_stdin = io.StringIO(USER_STDIN)
_old_stdout, _old_stderr, _old_stdin = sys.stdout, sys.stderr, sys.stdin
sys.stdout, sys.stderr, sys.stdin = _stdout, _stderr, _stdin
_EXEC_SUCCESS = True
try:
    exec(USER_CODE, {"__name__": "__main__"})
except Exception:
    traceback.print_exc(file=_stderr)
    _EXEC_SUCCESS = False
finally:
    sys.stdout, sys.stderr, sys.stdin = _old_stdout, _old_stderr, _old_stdin
_EXEC_STDOUT = _stdout.getvalue()
_EXEC_STDERR = _stderr.getvalue()
\`);

      self.postMessage({
        type: "result",
        id: msg.id,
        success: Boolean(pyodide.globals.get("_EXEC_SUCCESS")),
        stdout: String(pyodide.globals.get("_EXEC_STDOUT") || ""),
        stderr: String(pyodide.globals.get("_EXEC_STDERR") || ""),
      });
    } catch (error) {
      self.postMessage({
        type: "result",
        id: msg.id,
        success: false,
        stdout: "",
        stderr: String(error && error.message ? error.message : error),
      });
    }
  }
};
`;
  }

  function teardownWorker(reason) {
    if (!workerState) return;

    workerState.pending.forEach((pending) => {
      pending.reject(new Error(reason));
    });
    workerState.pending.clear();

    try {
      workerState.worker.terminate();
    } catch {
      // ignore
    }
    workerState = null;
  }

  function createRuntimeWorker() {
    const blob = new Blob([workerSource()], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);
    URL.revokeObjectURL(url);

    let readyResolve;
    let readyReject;
    const ready = new Promise((resolve, reject) => {
      readyResolve = resolve;
      readyReject = reject;
    });

    const pending = new Map();

    worker.onmessage = (event) => {
      const msg = event.data || {};
      if (msg.type === "ready") {
        readyResolve();
        return;
      }
      if (msg.type === "fatal") {
        readyReject(new Error(msg.error || "Runtime bootstrap failed"));
        teardownWorker(msg.error || "Runtime bootstrap failed");
        return;
      }
      if (msg.type === "result") {
        const waiter = pending.get(msg.id);
        if (!waiter) return;
        pending.delete(msg.id);
        waiter.resolve({
          success: !!msg.success,
          stdout: String(msg.stdout || ""),
          stderr: String(msg.stderr || ""),
        });
      }
    };

    worker.onerror = (error) => {
      readyReject(error);
      teardownWorker("Runtime worker crashed");
    };

    workerState = { worker, ready, pending };
    worker.postMessage({ type: "init" });
    return workerState;
  }

  async function ensureRuntimeReady() {
    if (!workerState) {
      createRuntimeWorker();
    }
    await workerState.ready;
    setStatus(
      tr(
        "Runtime ready (preloaded in worker)",
        "Runtime bereit (im Worker vorgeladen)",
      ),
    );
  }

  async function executePythonWithTimeout(code, stdinText, timeoutMs) {
    await ensureRuntimeReady();

    return await new Promise((resolve, reject) => {
      const id = ++messageSeq;
      const timer = setTimeout(() => {
        if (!workerState || !workerState.pending.has(id)) return;
        workerState.pending.delete(id);
        teardownWorker("Execution exceeded 1s timeout");
        createRuntimeWorker();
        ensureRuntimeReady().catch(() => {
          // status is handled by caller
        });
        reject(
          new Error(
            tr(
              "Execution timed out after 1000 ms",
              "Ausführung nach 1000 ms abgebrochen (Timeout)",
            ),
          ),
        );
      }, timeoutMs);

      workerState.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });

      workerState.worker.postMessage({
        type: "execute",
        id,
        code,
        stdin: stdinText || "",
      });
    });
  }

  async function runSingle() {
    setRunState(true);
    setStatus(tr("Running script...", "Code wird ausgeführt..."));
    setOutput(
      tr(
        "Running your code in the browser runtime...",
        "Dein Code wird in der Browser-Runtime ausgeführt...",
      ),
    );
    const startTime = performance.now();

    try {
      const stdin = document.getElementById("python-stdin").value;
      const result = await executePythonWithTimeout(
        editorInstance.getValue(),
        stdin,
        EXEC_TIMEOUT_MS,
      );
      const durationMs = Math.max(1, Math.round(performance.now() - startTime));

      const segments = [];
      segments.push({
        text: result.stdout || tr("<empty>", "<leer>"),
        isError: false,
      });
      if (result.stderr) {
        segments.push({ text: result.stderr, isError: true });
      }
      segments.push({
        text: tr(
          `Completed in ${durationMs} ms.`,
          `Abgeschlossen in ${durationMs} ms.`,
        ),
        isError: false,
      });
      setOutputSegments(segments);
      setStatus(
        result.success
          ? tr(
              `Run complete (${durationMs} ms)`,
              `Ausführung abgeschlossen (${durationMs} ms)`,
            )
          : tr(
              "Run failed (see traceback)",
              "Ausführung fehlgeschlagen (siehe Traceback)",
            ),
      );
    } catch (error) {
      const durationMs = Math.max(1, Math.round(performance.now() - startTime));
      setOutputSegments([
        {
          text: String(error && error.message ? error.message : error),
          isError: true,
        },
        {
          text: tr(
            `Stopped after ${durationMs} ms.`,
            `Nach ${durationMs} ms gestoppt.`,
          ),
          isError: false,
        },
      ]);
      setStatus(
        tr(
          "Run stopped (timeout or runtime error)",
          "Ausführung gestoppt (Timeout oder Laufzeitfehler)",
        ),
      );
    } finally {
      setRunState(false);
    }
  }

  async function runTests() {
    const tests = parseTests();
    if (!tests.length) {
      setStatus(tr("No test cases provided", "Keine Testfälle angegeben"));
      return;
    }

    setRunState(true);
    setStatus(tr("Running tests...", "Tests laufen..."));
    setOutput(
      tr(
        "Running test suite in the browser runtime...",
        "Testsuite läuft in der Browser-Runtime...",
      ),
    );
    const suiteStart = performance.now();
    const report = [];
    let passed = 0;

    try {
      for (let i = 0; i < tests.length; i += 1) {
        const test = tests[i];
        try {
          const result = await executePythonWithTimeout(
            editorInstance.getValue(),
            test.input + "\n",
            EXEC_TIMEOUT_MS,
          );

          const actual = result.stdout.trim();
          const expected = test.expected.trim();
          const ok = result.success && actual === expected;
          if (ok) passed += 1;

          report.push(
            `Test ${i + 1}: ${ok ? tr("PASS", "BESTANDEN") : tr("FAIL", "FEHLER")}`,
          );
          report.push(
            `  ${tr("input", "Input")}: ${JSON.stringify(test.input)}`,
          );
          report.push(
            `  ${tr("expected", "erwartet")}: ${JSON.stringify(expected)}`,
          );
          report.push(
            `  ${tr("actual", "aktuell")}: ${JSON.stringify(actual)}`,
          );
          if (result.stderr.trim()) {
            report.push(`  stderr: ${JSON.stringify(result.stderr.trim())}`);
          }
        } catch (error) {
          report.push(`Test ${i + 1}: ${tr("FAIL", "FEHLER")}`);
          report.push(
            `  ${tr("input", "Input")}: ${JSON.stringify(test.input)}`,
          );
          report.push(
            `  ${tr("reason", "Grund")}: ${tr(
              "timeout (>1000ms) or runtime failure",
              "Timeout (>1000ms) oder Laufzeitfehler",
            )}`,
          );
          report.push(
            `  ${tr("detail", "Detail")}: ${JSON.stringify(
              String(error && error.message ? error.message : error),
            )}`,
          );
        }
      }

      const durationMs = Math.max(
        1,
        Math.round(performance.now() - suiteStart),
      );
      report.push(
        "",
        tr(
          `Test run completed in ${durationMs} ms.`,
          `Testlauf abgeschlossen in ${durationMs} ms.`,
        ),
      );

      setOutput(report.join("\n"));
      setStatus(
        tr(
          `Tests complete: ${passed}/${tests.length} passed (1s timeout each)`,
          `Tests abgeschlossen: ${passed}/${tests.length} bestanden (1s Timeout pro Test)`,
        ),
      );
    } finally {
      setRunState(false);
    }
  }

  function resetEditor() {
    editorInstance.setValue(TEMPLATE);
    setOutput("");
    setStatus(tr("Editor reset", "Editor zurueckgesetzt"));
  }

  function submitPython() {
    const team = (document.getElementById("python-team").value || "").trim();
    const game = document.getElementById("python-game").value;
    const code = editorInstance.getValue().trim();

    if (!team || !code) {
      setSaveStatus(
        tr(
          "Team name and code are required",
          "Team-Name und Code sind erforderlich",
        ),
      );
      return;
    }

    window.MathathonStore.addSubmission("python", {
      team,
      game,
      code,
      language: "Python",
      submittedAt: new Date().toISOString(),
    });

    setSaveStatus(
      tr(
        "Python submission saved locally",
        "Python-Einreichung lokal gespeichert",
      ),
    );
  }

  async function bootstrap() {
    const editorRoot = document.getElementById("python-editor-root");
    const { editor } = await window.createMathathonEditor({
      container: editorRoot,
      language: "python",
      value: TEMPLATE,
    });
    editorInstance = editor;

    document.getElementById("run-python").addEventListener("click", runSingle);
    const inlineRun = document.getElementById("run-python-inline");
    if (inlineRun) {
      inlineRun.addEventListener("click", runSingle);
    }
    document.getElementById("test-python").addEventListener("click", runTests);
    document
      .getElementById("reset-python")
      .addEventListener("click", resetEditor);
    document
      .getElementById("submit-python")
      .addEventListener("click", submitPython);

    setStatus(
      tr(
        "Editor ready; runtime preload queued",
        "Editor bereit; Runtime-Vorladung gestartet",
      ),
    );
    setSaveStatus(tr("No submission yet", "Noch keine Einreichung"));
    setOutput(
      tr(
        "Ready. Runtime is preloading in the background.",
        "Bereit. Runtime wird im Hintergrund vorgeladen.",
      ),
    );

    ensureRuntimeReady().catch((error) => {
      setStatus(
        tr("Runtime preload failed: ", "Runtime-Vorladung fehlgeschlagen: ") +
          String(error && error.message ? error.message : error),
      );
    });
  }

  document.addEventListener("DOMContentLoaded", bootstrap);
})();
