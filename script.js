document.addEventListener("DOMContentLoaded", () => {
    const btnOpenForm = document.getElementById("btn-open-form");
    const btnCloseForm = document.getElementById("btn-close-form");
    const formScreen = document.getElementById("form-screen");
    const addForm = document.getElementById("add-form");
    const listContainer = document.getElementById("list-container");
    
    const btnExport = document.getElementById("btn-export");
    const fileImport = document.getElementById("file-import");

    // Pop-up éléments
    const confirmModal = document.getElementById("confirm-modal");
    const btnCancelDelete = document.getElementById("btn-cancel-delete");
    const btnConfirmDelete = document.getElementById("btn-confirm-delete");
    let itemToDeleteIndex = null;

    let entretiens = JSON.parse(localStorage.getItem("entretiens")) || [];

    btnOpenForm.addEventListener("click", () => formScreen.classList.remove("hidden"));
    btnCloseForm.addEventListener("click", () => formScreen.classList.add("hidden"));

    function formatDate(dateString) {
        const [year, month] = dateString.split("-");
        const dateObj = new Date(year, month - 1);
        return dateObj.toLocaleDateString("fr-FR", { month: "long" });
    }

    function renderList() {
        listContainer.innerHTML = "";

        if (entretiens.length === 0) {
            listContainer.innerHTML = '<p style="color: #b0b8c0; text-align: center; margin-top: 20px;">Aucun entretien enregistré.</p>';
            return;
        }

        entretiens.sort((a, b) => new Date(b.date) - new Date(a.date));

        let currentYear = null;

        entretiens.forEach((item, index) => {
            const year = item.date.split("-")[0];

            if (year !== currentYear) {
                currentYear = year;
                const yearDivider = document.createElement("div");
                yearDivider.className = "year-divider";
                yearDivider.textContent = `— ${year} —`;
                listContainer.appendChild(yearDivider);
            }

            const card = document.createElement("div");
            card.className = "card";

            const info = document.createElement("div");
            info.className = "card-info";
            
            const title = document.createElement("div");
            title.className = "card-title";
            title.textContent = item.name;

            const date = document.createElement("div");
            date.className = "card-date";
            let dateText = formatDate(item.date);
            if (item.km) {
                dateText += ` • ${Number(item.km).toLocaleString('fr-FR')} km`;
            }
            date.textContent = dateText;

            info.appendChild(title);
            info.appendChild(date);

            const btnDelete = document.createElement("button");
            btnDelete.className = "btn-delete";
            btnDelete.innerHTML = "×";
            btnDelete.addEventListener("click", (e) => {
                e.stopPropagation();
                btnDelete.blur(); // Enlève le focus du bouton immédiatement
                openDeleteModal(index);
            });

            card.appendChild(info);
            card.appendChild(btnDelete);
            listContainer.appendChild(card);
        });
    }

    // Gestion Pop-up Modal
    function openDeleteModal(index) {
        itemToDeleteIndex = index;
        confirmModal.classList.remove("hidden");
    }

    btnCancelDelete.addEventListener("click", () => {
        itemToDeleteIndex = null;
        confirmModal.classList.add("hidden");
    });

    btnConfirmDelete.addEventListener("click", () => {
        if (itemToDeleteIndex !== null) {
            entretiens.splice(itemToDeleteIndex, 1);
            localStorage.setItem("entretiens", JSON.stringify(entretiens));
            renderList();
            itemToDeleteIndex = null;
        }
        confirmModal.classList.add("hidden");
    });

    // Formulaire d'ajout
    addForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const nameInput = document.getElementById("intervention").value;
        const dateInput = document.getElementById("date-entretien").value;
        const kmInput = document.getElementById("km-entretien").value;

        if (nameInput && dateInput) {
            entretiens.push({ 
                name: nameInput, 
                date: dateInput, 
                km: kmInput || null 
            });
            localStorage.setItem("entretiens", JSON.stringify(entretiens));
            
            renderList();
            addForm.reset();
            formScreen.classList.add("hidden");
        }
    });

    // Export / Import
    btnExport.addEventListener("click", () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entretiens, null, 2));
        const downloadAnchor = document.createElement('a');
        const today = new Date().toISOString().slice(0, 10);
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `entretiens-${today}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    fileImport.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    entretiens = importedData;
                    localStorage.setItem("entretiens", JSON.stringify(entretiens));
                    renderList();
                    formScreen.classList.add("hidden");
                }
            } catch (error) {}
        };
        reader.readAsText(file);
    });

    renderList();
});
            
