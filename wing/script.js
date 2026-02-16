// Particle Animation
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    function setCanvasSize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        return { w, h };
    }
    setCanvasSize();

    const particles = [];
    const particleCount = window.innerWidth < 768 ? 40 : 100;

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            color: 'rgba(201,169,98,' + (Math.random() * 0.5 + 0.1) + ')'
        });
    }

    // Animation
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Move particles
            p.x += p.speedX;
            p.y += p.speedY;

            // Boundary check
            if (p.x < 0 || p.x > canvas.width) p.speedX = -p.speedX;
            if (p.y < 0 || p.y > canvas.height) p.speedY = -p.speedY;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = 'rgba(201,169,98,0.05)';
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', function () {
        setCanvasSize();
    });

    // Start animation
    animate();

    // Ramadan Countdown Timer
    const countdownElement = document.getElementById('countdown');
    const targetDate = new Date('2026-03-18T00:00:00').getTime();

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            countdownElement.innerHTML = 'Ramadan Mubarak! 10% discount throughout the month';
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        countdownElement.innerHTML = 'Ramadan Mubarak! 10% discount throughout the month';
    }

    // Update countdown every second
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Size selector functionality
    document.querySelectorAll('.size-btn').forEach(button => {
        button.addEventListener('click', function () {
            // Remove selected class from all size buttons
            this.parentElement.querySelectorAll('.size-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            // Add selected class to clicked button
            this.classList.add('selected');

            // Update WhatsApp button with selected size
            const productCard = this.closest('.product-card');
            if (productCard) {
                const selectedSize = this.textContent.trim();
                const productName = productCard.querySelector('.product-name').textContent.trim();
                const priceText = productCard.querySelector('.price-current').textContent.trim();
                const whatsappBtn = productCard.querySelector('.whatsapp-btn');

                if (whatsappBtn) {
                    const message = `أرغب في شراء هودي بتصميم '${productName}'، الموديل: ميلتون مبطن، الحجم: ${selectedSize}، السعر: ${priceText}`;
                    const encodedMessage = encodeURIComponent(message);
                    whatsappBtn.href = `https://wa.me/201017092501?text=${encodedMessage}`;
                }
            }
        });
    });

    // Material selector functionality
    document.querySelectorAll('.material-option').forEach(option => {
        option.addEventListener('click', function () {
            // Get the radio input
            const radio = this.querySelector('input');
            if (radio) {
                radio.checked = true;

                // Remove selected class from all material options in this card
                this.parentElement.querySelectorAll('.material-option').forEach(opt => {
                    opt.classList.remove('selected');
                });

                // Add selected class to clicked option
                this.classList.add('selected');

                // Update price display
                const materialPrice = this.querySelector('.material-price');
                const parentCard = this.closest('.product-card');
                const priceCurrent = parentCard.querySelector('.price-current');
                const priceOriginal = parentCard.querySelector('.price-original');

                // Update price elements
                priceCurrent.textContent = materialPrice.querySelector('.price-current').textContent;
                priceOriginal.textContent = materialPrice.querySelector('.price-original').textContent;

                // Update WhatsApp button with new price and selected material
                const productName = parentCard.querySelector('.product-name').textContent.trim();
                const newPrice = priceCurrent.textContent.trim();
                const selectedSize = parentCard.querySelector('.size-btn.selected').textContent.trim();
                const selectedMaterial = radio.value;
                const whatsappBtn = parentCard.querySelector('.whatsapp-btn');

                if (whatsappBtn) {
                    const message = `أرغب في شراء هودي بتصميم '${productName}'، الموديل: ${selectedMaterial}، الحجم: ${selectedSize}، السعر: ${newPrice}`;
                    const encodedMessage = encodeURIComponent(message);
                    whatsappBtn.href = `https://wa.me/201017092501?text=${encodedMessage}`;
                }
            }
        });
    });

    // Initialize selected class for checked material options
    document.querySelectorAll('.material-option input:checked').forEach(input => {
        input.closest('.material-option').classList.add('selected');
    });
});