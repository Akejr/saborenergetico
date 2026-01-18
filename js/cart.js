/**
 * Shopping Cart Logic for Sabor Energético
 * Handles localStorage persistence and UI updates
 */

const Cart = {
    items: [],

    init() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
        this.bindEvents();
        console.log('Cart initialized', this.items);
    },

    save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this.updateCartCount();
        // If modal is open, refresh it
        const cartModal = document.getElementById('cart-modal');
        if (cartModal && !cartModal.classList.contains('hidden')) {
            this.renderCartModal();
        }
    },

    addItem(id, name, price, image) {
        const existingItem = this.items.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                id,
                name,
                price: parseFloat(price),
                quantity: 1,
                image: image || 'images/placeholder.png'
            });
        }
        this.save();
        this.showFeedback();
        this.openCart(); // Auto open cart on add
    },

    removeItem(index) {
        this.items.splice(index, 1);
        this.save();
    },

    updateQuantity(index, change) {
        if (this.items[index]) {
            this.items[index].quantity += change;
            if (this.items[index].quantity < 1) {
                this.items.splice(index, 1);
            }
            this.save();
        }
    },

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        const countEl = document.getElementById('cart-count');
        if (countEl) countEl.textContent = count;
    },

    renderCartModal() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');

        if (!cartItemsContainer || !cartTotalEl) return;

        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center opacity-50 py-8">SEU CARRINHO ESTÁ VAZIO.<br>APROVEITE O DROP ANTES QUE ACABE.</p>';
            cartTotalEl.textContent = 'R$ 0,00';
            return;
        }

        let html = '';
        let total = 0;

        this.items.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="flex gap-4 py-4 border-b border-white/10">
                    <div class="h-16 w-16 bg-[#232629] rounded flex-shrink-0 bg-cover bg-center" style="background-image: url('${item.image}')"></div>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold uppercase text-sm tracking-tight">${item.name}</h4>
                            <button class="remove-btn text-urgency hover:opacity-70 text-xs uppercase font-bold" data-index="${index}">Remover</button>
                        </div>
                        <p class="text-xs opacity-50 font-mono mb-2">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
                        
                        <div class="flex items-center gap-3">
                            <button class="qty-btn w-6 h-6 border border-white/20 rounded flex items-center justify-center hover:bg-white/10 text-xs transition-colors" data-action="decrease" data-index="${index}">-</button>
                            <span class="font-bold text-sm w-4 text-center">${item.quantity}</span>
                            <button class="qty-btn w-6 h-6 border border-white/20 rounded flex items-center justify-center hover:bg-white/10 text-xs transition-colors" data-action="increase" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItemsContainer.innerHTML = html;
        cartTotalEl.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;

        // Re-bind dynamic events in modal
        this.bindModalEvents();
    },

    bindEvents() {
        // Add to Cart & Buy Now Buttons
        document.querySelectorAll('.add-to-cart, .buy-now-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => { // Async for Buy Now flow
                // Check size validation first if on product page
                if (typeof selectedSize !== 'undefined' && !selectedSize) {
                    alert('Por favor, selecione um tamanho.');
                    return;
                }

                // Determine if it's a card button or product page button
                const btn = e.currentTarget;
                const id = btn.dataset.id || 'unknown';
                const name = btn.dataset.name || document.title;
                const price = btn.dataset.price || '0.00';

                // Get Image
                let image = '';
                if (document.querySelector('.bg-cover[data-alt*="Costas"]')) {
                    const style = document.querySelector('.bg-cover[data-alt*="Costas"]').getAttribute('style');
                    const match = style.match(/url\("([^"]+)"\)/);
                    if (match) image = match[1];
                } else if (btn.closest('.offset-card')) {
                    const style = btn.closest('.offset-card').querySelector('.bg-center').getAttribute('style');
                    const match = style.match(/url\(['"]([^'"]+)['"]\)/);
                    if (match) image = match[1];
                }

                this.addItem(id, name, price, image);

                // If Buy Now, trigger checkout immediately
                if (btn.classList.contains('buy-now-btn')) {
                    this.openCart(); // Show user what happened
                    const checkoutBtn = document.getElementById('checkout-btn');
                    if (checkoutBtn) {
                        this.processCheckout(checkoutBtn);
                    }
                }
            });
        });

        // Cart Toggle
        const cartBtn = document.getElementById('cart-btn');
        const closeCart = document.getElementById('close-cart');
        const cartModal = document.getElementById('cart-modal');

        if (cartBtn && cartModal) {
            cartBtn.addEventListener('click', () => this.openCart());
        }
        if (closeCart && cartModal) {
            closeCart.addEventListener('click', () => this.closeCart());
        }
        if (cartModal) {
            cartModal.addEventListener('click', (e) => {
                if (e.target === cartModal) this.closeCart();
            });
        }

        // Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) return alert('Seu carrinho está vazio!');
                this.processCheckout(checkoutBtn);
            });
        }
    },

    async processCheckout(btn) {
        const originalText = btn.innerText;
        btn.innerText = 'Gerando Link...';
        btn.disabled = true;

        try {
            const items = this.items.map(item => ({
                description: item.name,
                quantity: item.quantity,
                price: Math.round(item.price * 100)
            }));

            const payload = {
                handle: "onlinepayment2026",
                items: items,
                redirect_url: window.location.origin + '/success.html'
            };

            // Lógica inteligente de Proxy:
            // - Localhost: Usa o proxy Python (cors_proxy.py)
            // - Produção (Vercel): Usa a Serverless Function (/api/checkout)
            let proxyUrl;
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                proxyUrl = 'http://localhost:8081';
            } else {
                proxyUrl = '/api/checkout'; // Caminho da função na Vercel
            }

            // Se for prod, não precisamos enviar a URL alvo como query param, pois a função já sabe pra onde ir
            // Se for local, o python proxy espera só o corpo, ele já tem a URL fixa (ou poderíamos mandar)
            // No nosso cors_proxy.py atual, ele tem TARGET_URL fixo.
            // Na função api/checkout.js, ela também tem URL fixa.
            // Então basta fazer o POST direto para a URL escolhida.

            const response = await fetch(proxyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Checkout Error:', errorData);
                throw new Error('Erro ao gerar link de pagamento. Tente novamente.');
            }

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de pagamento não retornada.');
            }

        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro ao processar o checkout: ' + error.message);
            btn.innerText = originalText;
            btn.disabled = false;
        }
    },
    bindModalEvents() {
        document.querySelectorAll('.qty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                const action = e.currentTarget.dataset.action;
                this.updateQuantity(index, action === 'increase' ? 1 : -1);
            });
        });

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.removeItem(index);
            });
        });
    },

    openCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            this.renderCartModal();
            cartModal.classList.remove('hidden');
            cartModal.classList.add('flex');
        }
    },

    closeCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.classList.add('hidden');
            cartModal.classList.remove('flex');
        }
    },

    showFeedback() {
        // Simple visual feedback could go here
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    Cart.init();
});
