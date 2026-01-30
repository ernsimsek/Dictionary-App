const result = document.getElementById("result");
const btn = document.getElementById("search-btn");
const themeToggle = document.getElementById("theme-toggle");

// --- Theme Logic ---
const currentTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", currentTheme);
updateThemeIcon(currentTheme);

themeToggle.addEventListener("click", () => {
    let theme = document.documentElement.getAttribute("data-theme");
    let newTheme = theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i");
    if (theme === "light") {
        icon.classList.replace("fa-moon", "fa-sun");
    } else {
        icon.classList.replace("fa-sun", "fa-moon");
    }
}

// --- Dictionary Logic ---
const inpWordElement = document.getElementById("inp-word");

function performSearch() {
    let inpWord = inpWordElement.value.trim();
    if (!inpWord) return;

    // Loading state
    result.innerHTML = `<div class="loading">Searching for "${inpWord}"...</div>`;

    fetch(`https://api.datamuse.com/words?sp=${inpWord}&md=d&max=1`)
        .then((response) => response.json())
        .then((data) => {
            if (data.length === 0 || !data[0].defs) {
                throw new Error("Word not found");
            }

            const wordData = data[0];
            const definitions = wordData.defs.map(def => {
                const parts = def.split("\t");
                return {
                    pos: parts[0] === "n" ? "noun" : parts[0] === "v" ? "verb" : parts[0] === "adj" ? "adjective" : parts[0] === "adv" ? "adverb" : "definition",
                    meaning: parts[1]
                };
            });

            const mainDef = definitions[0];

            result.innerHTML = `
            <div class="word-card fade-in">
                <div class="word-header">
                    <div class="title-section">
                        <h3>${wordData.word}</h3>
                        <span class="pos-badge">${mainDef.pos}</span>
                    </div>
                    <button class="speak-btn" onclick="pronounceWord('${wordData.word}')" title="Listen">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                </div>
                
                <div class="primary-meaning">
                    <p>${mainDef.meaning}</p>
                </div>

                ${definitions.length > 1 ? `
                    <div class="extra-defs">
                        <h4>More Definitions</h4>
                        <ul>
                            ${definitions.slice(1, 4).map(d => `
                                <li>
                                    <span class="mini-pos">${d.pos}</span>
                                    <span class="mini-text">${d.meaning}</span>
                                </li>
                            `).join("")}
                        </ul>
                    </div>
                ` : ""}
            </div>`;
        })
        .catch(() => {
            result.innerHTML = `
            <div class="error-card fade-in">
                <div class="error-icon"><i class="fa-solid fa-circle-exclamation"></i></div>
                <h3>Word Not Found</h3>
                <p>We couldn't find "${inpWord}" in our database.</p>
            </div>`;
        });
}

btn.addEventListener("click", performSearch);

inpWordElement.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        performSearch();
    }
});

function pronounceWord(word) {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;

        const btnIcon = document.querySelector(".speak-btn i");
        btnIcon.classList.add("playing");

        utterance.onend = () => {
            btnIcon.classList.remove("playing");
        };

        window.speechSynthesis.speak(utterance);
    } else {
        alert("Sorry, your browser doesn't support text to speech.");
    }
}