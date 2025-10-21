document.addEventListener('DOMContentLoaded', () => {
    // ##### CONFIGURACIÓ #####
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxSxP7hj_IaNThQ2mtn5x6Lf21BkZba0h4p4OA0Ow__ybWZmsAyovI35Jey-LjLSOY/exec'; 
    // ########################

    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const slotsContainer = document.getElementById('slots-container');
    const loader = document.getElementById('loader');
    const bookingForm = document.getElementById('booking-form');
    const mainContent = document.getElementById('main-content');
    const confirmationMessage = document.getElementById('confirmation-message');

    function displaySlots(slots) {
        loader.style.display = 'none';
        if (!slots || slots.length === 0) {
            slotsContainer.innerHTML = '<p class="text-gray-500 col-span-full">Actualment no hi ha hores disponibles.</p>';
            return;
        }
        slots.forEach(slot => {
            const button = document.createElement('button');
            button.className = 'flex flex-col items-center justify-center p-3 text-center bg-white border border-gray-200 rounded-md hover:bg-red-50 hover:border-red-400';
            button.innerHTML = `
                <span class="font-bold text-sm text-red-400">${slot.dayName}</span>
                <span class="text-xs text-gray-500">${slot.dateString}</span>
                <span class="text-lg font-bold text-gray-800 mt-1">${slot.timeString}</span>
            `;
            button.addEventListener('click', () => selectSlot(`${slot.dateString} - ${slot.timeString}`));
            slotsContainer.appendChild(button);
        });
    }

    function selectSlot(slotValue) {
        document.getElementById('slot').value = slotValue;
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        window.scrollTo(0, 0);
    }

    document.getElementById('back-btn').addEventListener('click', () => {
        step2.classList.add('hidden');
        step1.classList.remove('hidden');
        bookingForm.reset();
    });

    // Carregar els slots inicials
    fetch(`${APPS_SCRIPT_URL}?action=getSlots`)
        .then(response => response.json())
        .then(data => {
            if(data.error) throw new Error(data.error);
            displaySlots(data);
        })
        .catch(error => {
            loader.textContent = 'Error en carregar les hores. Intenta-ho de nou més tard.';
            console.error('Error fetching slots:', error);
        });

    // Gestionar l'enviament del formulari
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

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Important per a redireccions d'Apps Script
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            redirect: 'follow'
        })
        .then(response => {
            // Apps Script amb 'no-cors' no retorna una resposta llegible,
            // així que assumim èxit i confiem en el backend per a l'email.
            mainContent.classList.add('hidden');
            confirmationMessage.classList.remove('hidden');
        })
        .catch(error => {
            alert('Hi ha hagut un error en processar la reserva. Si us plau, contacta directament.');
            console.error('Error submitting booking:', error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Reserva';
        });
    });
});
