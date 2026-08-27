document.addEventListener('DOMContentLoaded', () => {
    // Éléments UI
    const btnInfo = document.getElementById('btn-info');
    const btnCloseInfo = document.getElementById('btn-close-info');
    const modalInfo = document.getElementById('modal-info');
    
    const btnOpenForm = document.getElementById('btn-open-form');
    const btnCloseForm = document.getElementById('btn-close-form');
    const screenForm = document.getElementById('screen-form');
    const formEntretien = document.getElementById('form-entretien');

    const listeEntretiens = document.getElementById('liste-entretiens');
    const modalConfirm = document.getElementById('modal-confirm');
    const btnCancelDelete = document.getElementById('btn-cancel-delete');
    const btnConfirmDelete = document.getElementById('btn-confirm-delete');

    const btnExport = document.getElementById('btn-export');
    const btnImport = document.getElementById('btn-import');
    const fileInput = document.getElementById('file-input');

    let entretiens = JSON.parse(localStorage.getItem('entretiens')) || [];
    let idToDelete = null;

    // --- POP-UP FICHE TECHNIQUE ---
    btnInfo.addEventListener('click', () => {
        modalInfo.classList.remove('hidden');
    });

    btnCloseInfo.addEventListener('click', () => {
        modalInfo.classList.add('hidden');
    });

    // --- FORMULAIRE D'AJOUT ---
    btnOpenForm.addEventListener('click', () => {
        screenForm.classList.remove('hidden');
    });

    btnCloseForm.addEventListener('click', () => {
        screenForm.classList.add('hidden');
    });

    formEntretien.addEventListener('submit', (e) => {
        e.preventDefault();

        const dateVal = document.getElementById('input-date').value;
        const titreVal = document.getElementById('input-titre').value;
        const kmVal = document.getElementById('input-km').value;
        const prixVal = document.getElementById('input-prix').value;

        const nouvelEntretien = {
            id: Date.now(),
            date: dateVal,
            titre: titreVal,
            km: parseInt(kmVal),
            prix: prixVal ? parseFloat(prixVal).toFixed(2) : null
        };

        entretiens.push(nouvelEntretien);
        sauvegarderEtAfficher();

        formEntretien.reset();
        screenForm.classList.add('hidden');
    });

    // --- SUPPRESSION ---
    window.demanderSuppression = function(id) {
        idToDelete = id;
        modalConfirm.classList.remove('hidden');
    };

    btnCancelDelete.addEventListener('click', () => {
        idToDelete = null;
        modalConfirm.classList.add('hidden');
    });

    btnConfirmDelete.addEventListener('click', () => {
        if (idToDelete !== null) {
            entretiens = entretiens.filter(item => item.id !== idToDelete);
            sauvegarderEtAfficher();
            idToDelete = null;
        }
        modalConfirm.classList.add('hidden');
    });

    // --- IMPORT / EXPORT (DANS LA PAGE AJOUTER) ---
    btnExport.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entretiens, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `entretiens_vehicule_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });

    btnImport.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                if (Array.isArray(importedData)) {
                    entretiens = importedData;
                    sauvegarderEtAfficher();
                    alert("Importation réussie !");
                } else {
                    alert("Format de fichier invalide.");
                }
            } catch (err) {
                alert("Erreur lors de la lecture du fichier JSON.");
            }
        };
        reader.readAsText(file);
    });

    // --- AFFICHAGE & SAUVEGARDE ---
    function sauvegarderEtAfficher() {
        localStorage.setItem('entretiens', JSON.stringify(entretiens));
        afficherEntretiens();
    }

    function afficherEntretiens() {
        listeEntretiens.innerHTML = '';

        if (entretiens.length === 0) {
            listeEntretiens.innerHTML = '<p class="empty-msg">Aucun entretien enregistré.</p>';
            return;
        }

        entretiens.sort((a, b) => new Date(b.date) - new Date(a.date));

        let currentYear = null;

        entretiens.forEach(item => {
            const dateObj = new Date(item.date);
            const annee = dateObj.getFullYear();

            if (annee !== currentYear) {
                currentYear = annee;
                const yearSeparator = document.createElement('div');
                yearSeparator.className = 'year-separator';
                yearSeparator.textContent = currentYear;
                listeEntretiens.appendChild(yearSeparator);
            }

            const card = document.createElement('div');
            card.className = 'card-entretien';
            
            const dateFormatee = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
            const prixTxt = item.prix ? ` • ${item.prix} €` : '';

            card.innerHTML = `
                <div class="card-icon">🛠️</div>
                <div class="card-details">
                    <h4>${item.titre}</h4>
                    <p>${dateFormatee} • ${item.km.toLocaleString('fr-FR')} km${prixTxt}</p>
                </div>
                <button class="btn-delete" onclick="demanderSuppression(${item.id})">&times;</button>
            `;

            listeEntretiens.appendChild(card);
        });
    }

    afficherEntretiens();
});
          
