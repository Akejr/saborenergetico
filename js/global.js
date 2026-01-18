// Sabor Energético Global Scripts
// Handles Countdown, WhatsApp Support, and other global behaviors

document.addEventListener('DOMContentLoaded', () => {
    initCountdown();
    injectWhatsAppButton();
    checkFirstVisit();
});

// 3. FIRST VISIT WARNING
function checkFirstVisit() {
    const hasSeen = localStorage.getItem('saboAvisoV1');
    if (!hasSeen) {
        injectWelcomeModal();
    }
}

function injectWelcomeModal() {
    const modalHtml = `
    <div id="welcome-modal" class="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-sm opacity-0 transition-opacity duration-300">
        <div class="bg-background-light dark:bg-background-dark border-2 border-urgency max-w-lg w-full p-8 rounded shadow-[8px_8px_0px_#D44A14] transform scale-95 transition-transform duration-300" id="welcome-content">
            <div class="flex items-center gap-4 mb-6 text-urgency">
                <span class="material-symbols-outlined text-5xl animate-pulse">warning</span>
                <h2 class="text-3xl font-black uppercase tracking-tighter leading-none">Atenção:<br>Protocolo Ativo</h2>
            </div>
            
            <div class="space-y-4 text-lg font-medium leading-relaxed opacity-90">
                <p>Você provavelmente <strong class="text-urgency">não verá este anúncio novamente</strong>.</p>
                <p>Este site tem data marcada para ser <span class="bg-urgency text-white px-1">EXCLUÍDO PERMANENTEMENTE</span>.</p>
                <p>Esta é uma oportunidade única. O cronômetro não vai parar.</p>
            </div>

            <button onclick="closeWelcomeModal()" 
                class="w-full bg-urgency text-white mt-8 py-4 font-black uppercase tracking-[0.2em] text-xl hover:brightness-110 hover:scale-[1.02] transition-all shadow-lg border-2 border-black dark:border-white">
                Entendi, Quero Acessar
            </button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Animate in
    requestAnimationFrame(() => {
        const modal = document.getElementById('welcome-modal');
        const content = document.getElementById('welcome-content');
        if (modal && content) {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        }
    });

    // Disable scrolling
    document.body.style.overflow = 'hidden';
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcome-modal');
    if (modal) {
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
            localStorage.setItem('saboAvisoV1', 'true');
        }, 300);
    }
}

// 1. FIXED COUNTDOWN TIMER
function initCountdown() {
    // Target Date: Jan 23, 2026 00:00:00
    const countdownDate = new Date('2026-01-23T00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = countdownDate - now;

        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update DOM elements if they exist
        const elDays = document.getElementById('days');
        const elHours = document.getElementById('hours');
        const elMinutes = document.getElementById('minutes');
        const elSeconds = document.getElementById('seconds');

        // Handling expired timer (optional)
        if (distance < 0) {
            if (elDays) elDays.textContent = "00";
            if (elHours) elHours.textContent = "00";
            if (elMinutes) elMinutes.textContent = "00";
            if (elSeconds) elSeconds.textContent = "00";
            return;
        }

        if (elDays) elDays.textContent = String(days).padStart(2, '0');
        if (elHours) elHours.textContent = String(hours).padStart(2, '0');
        if (elMinutes) elMinutes.textContent = String(minutes).padStart(2, '0');
        if (elSeconds) elSeconds.textContent = String(seconds).padStart(2, '0');
    }

    // Run immediately and then regular intervals
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// 2. WHATSAPP SUPPORT BUTTON
function injectWhatsAppButton() {
    const whatsappHtml = `
    <a href="https://wa.me/5519999245735" target="_blank" 
       class="fixed bottom-6 right-6 z-[90] bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:scale-110 hover:shadow-[0_0_30px_rgba(37,211,102,0.8)] transition-all duration-300 flex items-center justify-center group"
       aria-label="Atendimento via WhatsApp">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
        </svg>
        <span class="absolute right-full mr-3 bg-white text-black px-3 py-1 rounded text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Precisa de ajuda?
        </span>
    </a>
    `;
    document.body.insertAdjacentHTML('beforeend', whatsappHtml);
}
