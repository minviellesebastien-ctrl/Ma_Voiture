// Enregistrement du Service Worker (PWA)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then(() => console.log("Service Worker enregistré avec succès !"))
        .catch((err) => console.log("Erreur Service Worker :", err));
}

// Détection de l'icône SVG selon le titre de l'intervention
function getInterventionIcon(titre) {
    const text = titre.toLowerCase();

    // Pneus / Roues
    if (text.includes("pneu") || text.includes("roue") || text.includes("jante") || text.includes("crevaison")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m0 6v6m9-9h-6m-6 0H3"/></svg>`;
    }
    // Vidange / Huile
    if (text.includes("vidange") || text.includes("huile") || text.includes("filtre à huile") || text.includes("filtre a huile")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    }
    // Freins
    if (text.includes("frein") || text.includes("plaquette") || text.includes("disque")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24"/></svg>`;
    }
    // Batterie / Électricité
    if (text.includes("batterie") || text.includes("bougie") || text.includes("alternateur")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><line x1="6" y1="4" x2="6" y2="7"/><line x1="18" y1="4" x2="18" y2="7"/><line x1="6" y1="11" x2="10" y2="11"/><line x1="14" y1="11" x2="18" y2="11"/><line x1="16" y1="9" x2="16" y2="13"/></svg>`;
    }
    // Essuie-glaces / Pare-brise
    if (text.includes("essuie") || text.includes("balai") || text.includes("vitre") || text.includes("pare-brise")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c0-4.42 3.58-8 8-8s8 3.58 8 8"/><path d="M12 10V4"/><path d="M9 7l3-3 3 3"/></svg>`;
    }
    // Climatisation / Filtre habitacle
    if (text.includes("clim") || text.includes("recharge") || text.includes("habitacle")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20m10-10H2m17.07-7.07L4.93 19.07m0-14.14l14.14 14.14"/></svg>`;
    }
    // Liquide de refroidissement
    if (text.includes("refroidissement") || text.includes("liquide de refroidissement") || text.includes("antigel")) {
        return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/></svg>`;
    }

    // Icône par défaut (Clé à molette)
    return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
}

document.addEventListener("DOMContentLoaded", () => {
    let entretiens = JSON.parse(localStorage.getItem("entretiens_c4")) || [];
    let idToDelete = null;

    // Éléments du DOM
    const listContainer = document.getElementById("list-container");
    const btnOpenForm = document.getElementById("btn-open-form");
    const btnCloseForm = document.getElementById("btn-close-form");
    const formScreen = document.getElementById("form-screen");
    const addForm = document.getElementById("add-form");
    
    const btnOpenInfo = document.getElementById("btn-open-info");
    const btnCloseInfo = document.getElementById("btn-close-info");
    const infoModal = document.getElementById("info-modal");
    
    const confirmModal = document.getElementById("confirm-modal");
    const btnCancelDelete = document.getElementById("btn-cancel-delete");
    const btnConfirmDelete = document.getElementById("btn-confirm-delete");

    const btnExport = document.getElementById("btn-export");
    const fileImport = document.getElementById("file-import");

    // Gestion du défilement d'arrière-plan
    function toggleBodyScroll(disable) {
        document.body.style.overflow = disable ? "hidden" : "";
    }

    function saveAndRender() {
        localStorage.setItem("entretiens_c4", JSON.stringify(entretiens));
        renderList();
    }

    // Mois affiché en entier (ex: Janvier 2026)
    function formatDate(yyyyMm) {
        if (!yyyyMm) return "";
        const [year, month] = yyyyMm.split("-");
        const dateObj = new Date(year, month - 1);
        return dateObj.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }

    function formatKm(km) {
        return km ? Number(km).toLocaleString("fr-FR") + " km" : "";
    }

    function renderList() {
        listContainer.innerHTML = "";

        if (entretiens.length === 0) {
            listContainer.innerHTML = `<div class="empty-msg">Aucun entretien enregistré.</div>`;
            return;
        }

        // Tri du plus récent au plus ancien
        entretiens.sort((a, b) => new Date(b.date) - new Date(a.date));

        let currentYear = "";

        entretiens.forEach((item) => {
            const itemYear = item.date.split("-")[0];

            if (itemYear !== currentYear) {
                currentYear = itemYear;
                const yearSeparator = document.createElement("div");
                yearSeparator.className = "year-separator";
                yearSeparator.textContent = currentYear;
                listContainer.appendChild(yearSeparator);
            }

            const card = document.createElement("div");
            card.className = "card-entretien";

            const iconSvg = getInterventionIcon(item.intervention);
            const kmFormatted = formatKm(item.km);

            card.innerHTML = `
                <div class="card-icon">${iconSvg}</div>
                <div class="card-details">
                    <h4>${item.intervention}</h4>
                    <p>${formatDate(item.date)} ${kmFormatted ? "— " + kmFormatted : ""}</p>
                </div>
                <button class="btn-delete" data-id="${item.id}">×</button>
            `;

            listContainer.appendChild(card);
        });

        // Suppression d'une entrée
        document.querySelectorAll(".btn-delete").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                idToDelete = Number(e.target.dataset.id);
                confirmModal.classList.remove("hidden");
                toggleBodyScroll(true);
            });
        });
    }

    // Gestion de la modale "i"
    btnOpenInfo.addEventListener("click", () => {
        infoModal.classList.remove("hidden");
        toggleBodyScroll(true);
    });

    btnCloseInfo.addEventListener("click", () => {
        infoModal.classList.add("hidden");
        toggleBodyScroll(false);
    });

    // Formulaire d'ajout
    btnOpenForm.addEventListener("click", () => {
        formScreen.classList.remove("hidden");
        toggleBodyScroll(true);
    });

    btnCloseForm.addEventListener("click", () => {
        formScreen.classList.add("hidden");
        toggleBodyScroll(false);
    });

    addForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const newItem = {
            id: Date.now(),
            intervention: document.getElementById("intervention").value.trim(),
            date: document.getElementById("date-entretien").value,
            km: document.getElementById("km-entretien").value || null
        };

        entretiens.push(newItem);
        saveAndRender();

        addForm.reset();
        formScreen.classList.add("hidden");
        toggleBodyScroll(false);
    });

    // Confirmation de suppression
    btnCancelDelete.addEventListener("click", () => {
        confirmModal.classList.add("hidden");
        idToDelete = null;
        toggleBodyScroll(false);
    });

    btnConfirmDelete.addEventListener("click", () => {
        if (idToDelete) {
            entretiens = entretiens.filter((item) => item.id !== idToDelete);
            saveAndRender();
        }
        confirmModal.classList.add("hidden");
        idToDelete = null;
        toggleBodyScroll(false);
    });

    // Touche Échap
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            infoModal.classList.add("hidden");
            confirmModal.classList.add("hidden");
            formScreen.classList.add("hidden");
            toggleBodyScroll(false);
        }
    });

    // Exportation
    btnExport.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entretiens, null, 2));
        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `entretien_c4_picasso_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    // Importation
    fileImport.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    entretiens = importedData;
                    saveAndRender();
                    alert("Données importées avec succès !");
                    formScreen.classList.add("hidden");
                    toggleBodyScroll(false);
                } else {
                    alert("Format de fichier invalide.");
                }
            } catch (err) {
                alert("Erreur lors de la lecture du fichier.");
            }
        };
        reader.readAsText(file);
    });

    renderList();
});
                                                
