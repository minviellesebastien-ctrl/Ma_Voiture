document.addEventListener('DOMContentLoaded', () => {
    // Éléments UI
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

    // --- DICTIONNAIRE DE SVG PAR INTERVENTION ---
    function getInterventionSVG(titre) {
        const text = titre.toLowerCase();
        
        // Vidange / Huile / Filtre huile
        if (text.includes('vidange') || text.includes('huile')) {
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6"/><path d="m5 10 7-7 7 7"/><path d="M5 10v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10"/><path d="M12 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>`;
        }
        // Freins / Plaquettes / Disques
        if (text.includes('frein') || text.includes('plaquette') || text.includes('disque')) {
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3"/><path d="M12 18v3"/><path d="M3 12h3"/><path d="M18 12h3"/></svg>`;
        }
        // Pneus / Roues
        if (text.includes('pneu') || text.includes('roue') || text.includes('crevaison')) {
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="m12 3 2 5"/><path d="m12 21-2-5"/><path d="m3 12 5 2"/><path d="m21 12-5-2"/></svg>`;
        }
        // Batterie / Électricité
        if (text.includes('batterie') || text.includes('bougie') || text.includes('alternateur')) {
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M6 4v4"/><path d="M18 4v4"/><path d="M10 13h4"/><path d="M12 11v4"/></svg>`;
        }
        // Essuie-glace / Lavage
        if (text.includes('essuie') || text.includes('glace') || text.includes('pare-brise')) {
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/><path d="M12 10V4"/><path d="m9 7 3-3 3 3"/></svg>`;
        }
        // Climatisation / Filtre habitacle
        if (text.includes('clim') || text.includes('air') || text.includes('habitacle')) {
            return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M4.93 4.93l14.14 14.14"/><path d="M4.93 19.07L19.07 4.93"/><path d="M2 12h20"/></svg>`;
        }
        
        // Icône par défaut (Clé / Outillage)
        return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;
    }

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
            const svgIcon = getInterventionSVG(item.titre);

            card.innerHTML = `
                <div class="card-icon">${svgIcon}</div>
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
                             
