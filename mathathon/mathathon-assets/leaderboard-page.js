(function () {
    function render() {
        const rows = window.MathathonStore.getRows();
        const submissions = window.MathathonStore.getSubmissions();

        const body = document.getElementById("leaderboard-body");
        body.innerHTML = "";
        rows.forEach((row, index) => {
            const tr = document.createElement("tr");
            tr.innerHTML = "<td>" + (index + 1) + "</td><td>" + row.team + "</td><td>" + row.score + "</td><td>" + row.submissions + "</td>";
            body.appendChild(tr);
        });

        const feed = document.getElementById("activity-feed");
        feed.innerHTML = "";
        submissions.slice(0, 14).forEach((sub) => {
            const li = document.createElement("li");
            const timestamp = new Date(sub.submittedAt).toLocaleString();
            li.textContent = `${timestamp} | ${sub.team} | ${sub.language} | ${sub.game}`;
            feed.appendChild(li);
        });

        if (!submissions.length) {
            const li = document.createElement("li");
            li.textContent = "No local submissions yet";
            feed.appendChild(li);
        }

        const lastUpdated = document.getElementById("last-updated");
        if (lastUpdated) {
            lastUpdated.textContent = new Date().toLocaleTimeString();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        render();
        document.getElementById("refresh-board").addEventListener("click", render);
    });

    window.addEventListener("storage", render);
    window.addEventListener("mathathon-submissions-updated", render);
})();
