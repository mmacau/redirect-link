
document.addEventListener('DOMContentLoaded', () => {
    // ##################################################################
    // ##### CONFIGURACIÓ: Enganxa la URL de la teva API d'Apps Script ##
    // ##################################################################
    // https://script.google.com/macros/s/AKfycbxSxP7hj_IaNThQ2mtn5x6Lf21BkZba0h4p4OA0Ow__ybWZmsAyovI35Jey-LjLSOY/exec
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyjNX10Zbkne1WPMET_k1KrJwUGM4ACnksl5qLrO0C_U80vcoHiN6tN8DeLh1accScZ/exec'; 
    // ##################################################################


    // Selecció d'elements del DOM jkn,
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const slotsContainer = document.getElementById('slots-container');
    const loader = document.getElementById('loader');
    const bookingForm = document.getElementById('booking-form');
    const mainContent = document.getElementById('main-content');
    const confirmationMessage = document.getElementById('confirmation-message');
    const backButton = document.getElementById('back-btn');

    /**
     * Mostra els slots disponibles a la interfície.
     * @param {Array} slots - Un array d'objectes, cadascun representant un slot.
     */
    function displaySlots(slots) {
        loader.style.display = 'none';
        slotsContainer.innerHTML = ''; // Neteja el contenidor abans d'afegir nous slots

        if (!slots || slots.length === 0) {
            slotsContainer.innerHTML = '<p class="text-gray-500 col-span-full">Actualment no hi ha hores disponibles.</p>';
            return;
        }

        slots.forEach(slot => {
            const button = document.createElement('button');
            button.className = 'flex flex-col items-center justify-center p-3 text-center bg-white border border-gray-200 rounded-md hover:bg-red-50 hover:border-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-300';
            
            button.innerHTML = `
                <span class="font-bold text-sm text-red-400">${slot.dayName}</span>
                <span class="text-xs text-gray-500">${slot.dateString}</span>
                <span class="text-lg font-bold text-gray-800 mt-1">${slot.timeString}</span>
            `;
            
            button.addEventListener('click', () => {
                const slotValue = `${slot.dateString} - ${slot.timeString}`;
                selectSlot(slotValue);
            });
            
            slotsContainer.appendChild(button);
        });
    }

    /**
     * Gestiona la selecció d'un slot, amaga el pas 1 i mostra el pas 2.
     * @param {string} slotValue - El text del slot seleccionat (ex: "25/12/2025 - 10:00").
     */
    function selectSlot(slotValue) {
        document.getElementById('slot').value = slotValue;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    /**
     * Gestiona el botó de "Tornar", amaga el pas 2 i mostra el pas 1.
     */
    backButton.addEventListener('click', () => {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
        bookingForm.reset();
    });

    /**
     * Funció principal per carregar els slots des de l'API en iniciar la pàgina.
     */
    function fetchAvailableSlots() {
        fetch(`${APPS_SCRIPT_URL}?action=getSlots`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error de xarxa: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.error) {
                    throw new Error(`Error de l'API: ${data.error}`);
                }
                displaySlots(data);
            })
            .catch(error => {
                loader.textContent = 'Error en carregar les hores. Intenta-ho de nou més tard.';
                console.error('Error fetching slots:', error);
            });
    }

    /**
     * Listener per a l'enviament del formulari de reserva.
     */
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processant...';

        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            slot: document.getElementById('slot').value,
        };

        // La URL ha de ser la base, sense paràmetres GET per a una petició POST
        const postUrl = APPS_SCRIPT_URL;

        fetch(postUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Apps Script gestiona millor text/plain en peticions POST d'aquest tipus
            },
            body: JSON.stringify(formData),
            redirect: 'follow' // Important per a les redireccions internes d'Apps Script
        })
        .then(response => {
            if (!response.ok) {
                // Si la resposta no és OK, intentem llegir el missatge d'error igualment
                return response.text().then(text => {
                    throw new Error(`Error del servidor: ${text}`);
                });
            }
            return response.json(); // Intentem llegir la resposta JSON
        })
        .then(result => {
            if (result.success) {
                mainContent.classList.add('hidden');
                confirmationMessage.classList.remove('hidden');
            } else {
                // Si el backend retorna un error controlat (ex: slot ja reservat)
                alert('Error en la reserva: ' + result.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Confirmar Reserva';
            }
        })
        .catch(error => {
            // Error de xarxa o error en processar la resposta
            alert('Hi ha hagut un error de connexió. Si us plau, contacta directament.');
            console.error('Error submitting booking:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Reserva';
        });
    });

    // Cridem la funció per carregar els slots quan la pàgina està llesta
    fetchAvailableSlots();
});
