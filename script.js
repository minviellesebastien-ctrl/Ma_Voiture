document.addEventListener('DOMContentLoaded', () => {
    // Éléments UI selon tes identifiants
    const btnOpenInfo = document.getElementById('btn-open-info');
    const btnCloseInfo = document.getElementById('btn-close-info');
    const infoModal = document.getElementById('info-modal');
    
    const btnOpenForm = document.getElementById('btn-open-form');
    const btnCloseForm = document.getElementById('btn-close-form');
    const formScreen = document.getElementById('form-screen');
    const addForm = document.getElementById('add-form');

    const listContainer = document.getElementById('list-container');
    const confirmModal = document.getElementById('confirm-modal');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    const btnExport = document.getElementById('btn-export');
    const fileImport = document.getElementById('file-import');
    const customToast = document.getElementById('custom-toast');

    let entretiens = JSON.parse(localStorage.getItem('entretiens_c4')) || [];
    let idToDelete = null;

    // --- TOAST NOTIFICATION ---
    function afficherNotification(msg) {
        customToast.textContent = msg;
        customToast.classList.remove('hidden');
        setTimeout(() => {
            customToast.classList.add('hidden');
        }, 2500);
    }

    // --- MODALE FICHE TECHNIQUE ---
    btnOpenInfo.addEventListener('click', () => {
        infoModal.classList.remove('hidden');
    });

    btnCloseInfo.addEventListener('click', () => {
        infoModal.classList.add('hidden');
    });

    // --- OUVERTURE / FERMETURE FORMULAIRE ---
    btnOpenForm.addEventListener('click', () => {
        formScreen.classList.remove('hidden');
    });

    btnCloseForm.addEventListener('click', () => {
        formScreen.classList.add('hidden');
    });

    // --- AJOUT D'UNE INTERVENTION ---
    addForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const interventionVal = document.getElementById('intervention').value;
        const dateVal = document.getElementById('date-entretien').value;
        const kmVal = document.getElementById('km-entretien').value;

        const nouvelEntretien = {
            id: Date.now(),
            titre: interventionVal,
            date: dateVal,
            km: kmVal ? parseInt(kmVal) : null
        };

        entretiens.push(nouvelEntretien);
        sauvegarderEtAfficher();

        addForm.reset();
        formScreen.classList.add('hidden');
    });

    // --- SUPPRESSION ---
    window.demanderSuppression = function(id) {
        idToDelete = id;
        confirmModal.classList.remove('hidden');
    };

    btnCancelDelete.addEventListener('click', () => {
        idToDelete = null;
        confirmModal.classList.add('hidden');
    });

    btnConfirmDelete.addEventListener('click', () => {
        if (idToDelete !== null) {
            entretiens = entretiens.filter(item => item.id !== idToDelete);
            sauvegarderEtAfficher();
            idToDelete = null;
        }
        confirmModal.classList.add('hidden');
    });

    // --- EXPORTER / IMPORTER ---
    btnExport.addEventListener('click', () => {
        if (entretiens.length === 0) {
            afficherNotification("Aucune donnée à exporter");
            return;
        }
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entretiens, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `entretiens_c4picasso_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        afficherNotification("Données exportées");
    });

    fileImport.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    entretiens = importedData;
                    sauvegarderEtAfficher();
                    afficherNotification("Données importées");
                } else {
                    afficherNotification("Format de fichier invalide");
                }
            } catch (err) {
                afficherNotification("Erreur de lecture du fichier");
            }
        };
        reader.readAsText(file);
    });

    // --- SAUVEGARDE & GENERATION DE LA LISTE ---
    function sauvegarderEtAfficher() {
        localStorage.setItem('entretiens_c4', JSON.stringify(entretiens));
        afficherEntretiens();
    }

    function afficherEntretiens() {
        listContainer.innerHTML = '';

        if (entretiens.length === 0) {
            listContainer.innerHTML = '<p class="empty-msg">Aucun entretien enregistré.</p>';
            return;
        }

        entretiens.sort((a, b) => new Date(b.date) - new Date(a.date));

        let currentYear = null;

        entretiens.forEach(item => {
            const dateObj = new Date(item.date + "-01");
            const annee = dateObj.getFullYear();

            if (annee !== currentYear) {
                currentYear = annee;
                const yearSeparator = document.createElement('div');
                yearSeparator.className = 'year-separator';
                yearSeparator.textContent = currentYear;
                listContainer.appendChild(yearSeparator);
            }

            const card = document.createElement('div');
            card.className = 'card-entretien';
            
            const dateFormatee = dateObj.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            const kmTxt = item.km ? ` • ${item.km.toLocaleString('fr-FR')} km` : '';

            card.innerHTML = `
                <div class="card-icon">🛠️</div>
                <div class="card-details">
                    <h4>${item.titre}</h4>
                    <p>${dateFormatee}${kmTxt}</p>
                </div>
                <button class="btn-delete" onclick="demanderSuppression(${item.id})">&times;</button>
            `;

            listContainer.appendChild(card);
        });
    }

    afficherEntretiens();
});
          
