(function () {
  const BASE_TEAMS = [
    { team: "Team Euler", score: 21, submissions: 0 },
    { team: "Team Noether", score: 19, submissions: 0 },
    { team: "Team Ramanujan", score: 17, submissions: 0 },
    { team: "Team Turing", score: 15, submissions: 0 },
  ];

  const STORAGE_KEYS = {
    python: "mathathon_python_submissions_v2",
    cpp: "mathathon_cpp_submissions_v2",
  };

  function setFullHeightVar() {
    document.body.style.setProperty("--full-height", window.innerHeight + "px");
  }

  function applyTheme(initialOnly) {
    const saved = localStorage.getItem("style") || "light";
    if (!document.body.dataset.style || initialOnly) {
      document.body.dataset.style = saved;
    }
  }

  function toggleTheme(event) {
    const current = document.body.dataset.style === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    document.body.dataset.style = next;
    localStorage.setItem("style", next);
    window.dispatchEvent(
      new CustomEvent("mathathon-theme-changed", { detail: { style: next } }),
    );
    if (event) {
      event.preventDefault();
    }
  }

  function applyLanguage(initialOnly) {
    if (localStorage.getItem("lang") == null) {
      const userDefaultLang = navigator.language || navigator.userLanguage;
      if (userDefaultLang && userDefaultLang.startsWith("de")) {
        localStorage.setItem("lang", "de");
      } else {
        localStorage.setItem("lang", "en");
      }
    }
    if (!document.documentElement.lang || initialOnly) {
      document.documentElement.lang = localStorage.getItem("lang");
    }
  }

  function initLanguageButtons() {
    const changeLangButtons = document.querySelectorAll(".change-lang-button");
    for (const changeLangButton of changeLangButtons) {
      changeLangButton.onclick = (event) => {
        const languages = ["en", "de"];
        const currStyle = localStorage.getItem("lang") || languages[0];
        const nextIndex = (languages.indexOf(currStyle) + 1) % languages.length;
        localStorage.setItem("lang", languages[nextIndex]);
        document.documentElement.lang = localStorage.getItem("lang");

        changeLangButton.animate(
          [{ transform: "rotateX(0deg)" }, { transform: "rotateX(360deg)" }],
          {
            easing: "ease-in-out",
            duration: 350,
            fill: "forwards",
          },
        );

        event.preventDefault();
      };
    }
  }

  function setHeaderState() {
    const header = document.querySelector("header");
    const headerDropMenu = document.querySelector(".header-drop-menu");
    if (!header) return;

    if (window.scrollY <= 0) {
      header.classList.add("at-top");
      if (headerDropMenu) headerDropMenu.classList.add("at-top");
    } else {
      header.classList.remove("at-top");
      if (headerDropMenu) headerDropMenu.classList.remove("at-top");
    }
  }

  function initHeaderMenu() {
    const header = document.querySelector("header");
    const hamburger = document.querySelector(".hamburger-icon");
    const headerDropMenu = document.querySelector(".header-drop-menu");

    if (!header || !hamburger || !headerDropMenu) return;

    hamburger.onclick = () => {
      header.classList.toggle("expanded");
      hamburger.classList.toggle("x");
      headerDropMenu.classList.toggle("visible");
    };
  }

  function markCurrentLink() {
    const currentPage = document.body.dataset.page || "";
    const links = document.querySelectorAll("a[data-nav]");
    links.forEach((link) => {
      if ((link.dataset.nav || "") === currentPage) {
        link.classList.add("current");
      }
    });
  }

  function initThemeButtons() {
    const buttons = document.querySelectorAll(".theme-changer");
    buttons.forEach((button) => {
      button.onclick = toggleTheme;
    });
  }

  function fillFooterYear() {
    Array.from(document.querySelectorAll('[data-fill="footer-year"]')).forEach(
      (e) => {
        e.textContent = new Date().getFullYear();
      },
    );
  }

  function initGameOfLifeBackground() {
    const canvas = document.getElementById("game-of-life-background");
    if (!canvas) return;

    const gridSize = { x: 40, y: 100 };
    const TRANSPARENCY = 0.2;
    const logoColors = [
      "#90e979",
      "#62db3d",
      "#18556d",
      "#c22ff1",
      "#201131",
      "#4273b5",
      "#223759",
      "#080d15",
      "#020305",
    ];
    const randomLogoOffset = Math.floor(Math.random() * logoColors.length);
    const greyScales = Array.from({ length: gridSize.x * gridSize.y }).map(
      () => `rgba(0, 0, 0, ${Math.random() * 0.1 + 0.05})`,
    );

    const context = canvas.getContext("2d");
    let grid = new Uint8Array(gridSize.x * gridSize.y);

    function setGrid(targetGrid, x, y, on = true) {
      const i = y * gridSize.x + x;
      targetGrid[i] = on ? 1 : 0;
    }

    function getGrid(targetGrid, x, y) {
      if (x < 0 || y < 0 || x > gridSize.x - 1 || y > gridSize.y - 1) {
        return false;
      }
      const i = y * gridSize.x + x;
      return targetGrid[i] === 1;
    }

    const neighbourDirections = [
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
    ];

    function getSurroundingSum(targetGrid, x, y) {
      let sum = 0;
      for (const [dx, dy] of neighbourDirections) {
        sum += getGrid(targetGrid, x + dx, y + dy);
      }
      return sum;
    }

    function applyGridRules() {
      const newGrid = new Uint8Array(grid.length);
      for (let x = 0; x < gridSize.x; x += 1) {
        for (let y = 0; y < gridSize.y; y += 1) {
          const surroundingSum = getSurroundingSum(grid, x, y);
          if (getGrid(grid, x, y)) {
            if (surroundingSum >= 2 && surroundingSum <= 3) {
              setGrid(newGrid, x, y, true);
            }
          } else if (surroundingSum === 3) {
            setGrid(newGrid, x, y, true);
          }
        }
      }
      grid = newGrid;
    }

    function updateCanvas() {
      context.clearRect(0, 0, canvas.width, canvas.height);

      const cellWidth = canvas.width / gridSize.x;
      const cellHeight = cellWidth;

      context.globalAlpha = TRANSPARENCY;
      for (let x = 0; x < gridSize.x; x += 1) {
        for (let y = 0; y < gridSize.y; y += 1) {
          const value = getGrid(grid, x, y);
          if (value) {
            context.fillStyle =
              logoColors[
                (y * gridSize.x + x + randomLogoOffset) % logoColors.length
              ];
          } else {
            context.fillStyle =
              greyScales[(y * gridSize.x + x) % greyScales.length];
          }

          context.fillRect(
            x * cellWidth,
            y * cellHeight,
            cellWidth,
            cellHeight,
          );
        }
      }
      context.globalAlpha = 1;
    }

    const GUN =
      "------------------------X/----------------------X-X/------------XX------XX------------XX/-----------X---X----XX------------XX/XX--------X-----X---XX/XX--------X---X-XX----X-X/----------X-----X-------X/-----------X---X/------------XX";
    const gunOffset = { x: 2, y: 2 };
    const gunLines = GUN.split("/");

    for (let i = 0; i < gunLines.length; i += 1) {
      for (let j = 0; j < gunLines[i].length; j += 1) {
        if (gunLines[i][j] === "X") {
          setGrid(grid, j + gunOffset.x, i + gunOffset.y, true);
        }
      }
    }

    const urlParams = new URLSearchParams(location.search);
    const highSpeedModeActive = urlParams.has("highspeed");
    const updateIntervalMs = highSpeedModeActive ? 100 : 1000;
    let loopTimeout = null;

    function loop() {
      updateCanvas();
      applyGridRules();
      loopTimeout = setTimeout(loop, updateIntervalMs);
    }

    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const clickPos = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      const gridPos = {
        x: Math.floor(clickPos.x / (canvas.width / gridSize.x)),
        y: Math.floor(clickPos.y / (canvas.width / gridSize.x)),
      };

      const value = getGrid(grid, gridPos.x, gridPos.y);
      setGrid(grid, gridPos.x, gridPos.y, !value);

      if (loopTimeout !== null) {
        clearTimeout(loopTimeout);
      }
      loopTimeout = setTimeout(loop, updateIntervalMs);
      updateCanvas();
    });

    function resizeCanvas() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      updateCanvas();
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    loop();
  }

  function parseStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      return [];
    }
  }

  const MathathonStore = {
    addSubmission(language, payload) {
      const key = language === "cpp" ? STORAGE_KEYS.cpp : STORAGE_KEYS.python;
      const current = parseStore(key);
      current.unshift(payload);
      localStorage.setItem(key, JSON.stringify(current.slice(0, 120)));
      window.dispatchEvent(new CustomEvent("mathathon-submissions-updated"));
    },
    getSubmissions() {
      const python = parseStore(STORAGE_KEYS.python).map((s) => ({
        ...s,
        language: "Python",
      }));
      const cpp = parseStore(STORAGE_KEYS.cpp).map((s) => ({
        ...s,
        language: "C++",
      }));
      return [...python, ...cpp].sort((a, b) => {
        const ta = new Date(a.submittedAt).getTime();
        const tb = new Date(b.submittedAt).getTime();
        return tb - ta;
      });
    },
    getRows() {
      const rows = new Map(BASE_TEAMS.map((row) => [row.team, { ...row }]));
      MathathonStore.getSubmissions().forEach((sub) => {
        if (!rows.has(sub.team)) {
          rows.set(sub.team, { team: sub.team, score: 10, submissions: 0 });
        }
        const row = rows.get(sub.team);
        row.submissions += 1;
        row.score += 1;
      });
      return [...rows.values()].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.team.localeCompare(b.team);
      });
    },
  };

  window.MathathonStore = MathathonStore;

  document.addEventListener("DOMContentLoaded", () => {
    setFullHeightVar();
    applyTheme(true);
    applyLanguage(true);
    fillFooterYear();

    initLanguageButtons();
    initHeaderMenu();
    initThemeButtons();
    markCurrentLink();
    setHeaderState();
    initGameOfLifeBackground();

    window.addEventListener("resize", setFullHeightVar);
    window.addEventListener("scroll", setHeaderState);
  });
})();
