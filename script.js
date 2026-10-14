// Interatividade - Óleo Certo LP Power
// (A cena 3D do hero fica no <script type="module"> no final do index.html)

(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
    if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

    // ---------- Barra de progresso + navbar ----------
    const progress = document.querySelector('.scroll-progress');
    const nav = document.getElementById('nav');
    let ticking = false;

    const onScroll = () => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        nav.classList.toggle('is-scrolled', window.scrollY > 40);
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    // ---------- Menu mobile ----------
    const menuBtn = document.getElementById('menu-btn');
    const menu = document.getElementById('mobile-menu');

    const setMenu = open => {
        menu.classList.toggle('hidden', !open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        if (open) nav.classList.add('is-scrolled');
        else onScroll();
    };
    menuBtn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

    // ---------- Revelação ao rolar ----------
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Anima apenas uma vez
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ---------- Título do hero palavra por palavra ----------
    const splitWords = el => {
        [...el.childNodes].forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
                const frag = document.createDocumentFragment();
                child.textContent.split(/(\s+)/).forEach(part => {
                    if (!part) return;
                    if (/^\s+$/.test(part)) {
                        frag.appendChild(document.createTextNode(' '));
                        return;
                    }
                    const w = document.createElement('span');
                    w.className = 'w';
                    const inner = document.createElement('span');
                    inner.className = 'w-in';
                    inner.textContent = part;
                    w.appendChild(inner);
                    frag.appendChild(w);
                });
                el.replaceChild(frag, child);
            } else if (child.nodeType === Node.ELEMENT_NODE) {
                splitWords(child);
            }
        });
    };
    document.querySelectorAll('[data-split]').forEach(splitWords);

    if (hasGSAP && !reduced) {
        gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'transform,opacity' } })
            .from('.hero-badge', { y: 20, opacity: 0, duration: 0.6 })
            .from('.hero-title .w-in', { yPercent: 110, duration: 0.9, stagger: 0.05 }, '-=0.3')
            .from('.hero-sub', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
            .from('.hero-ctas > *', { y: 20, opacity: 0, duration: 0.6, stagger: 0.1 }, '-=0.4')
            .from('.hero-chips > *', { y: 10, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
            .from('.hero-visual', { scale: 0.9, opacity: 0, duration: 1.2 }, 0.2);
    }

    // ---------- Faixa de óleos: duplica o conteúdo para o loop infinito ----------
    document.querySelectorAll('.marquee-track').forEach(track => {
        [...track.children].forEach(item => {
            const clone = item.cloneNode(true);
            clone.setAttribute('aria-hidden', 'true');
            track.appendChild(clone);
        });
    });

    // ---------- Tilt 3D nos cards ----------
    if (finePointer && !reduced) {
        document.querySelectorAll('[data-tilt]').forEach(el => {
            const max = parseFloat(el.dataset.tilt) || 8;
            el.addEventListener('pointerenter', () => el.classList.remove('is-resting'));
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left) / r.width;
                const y = (e.clientY - r.top) / r.height;
                el.style.setProperty('--ry', `${(x - 0.5) * max * 2}deg`);
                el.style.setProperty('--rx', `${(0.5 - y) * max * 2}deg`);
                el.style.setProperty('--mx', `${x * 100}%`);
                el.style.setProperty('--my', `${y * 100}%`);
            });
            el.addEventListener('pointerleave', () => {
                el.classList.add('is-resting');
                el.style.setProperty('--rx', '0deg');
                el.style.setProperty('--ry', '0deg');
            });
        });

        // ---------- Botões magnéticos ----------
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('pointermove', e => {
                const r = el.getBoundingClientRect();
                el.style.setProperty('--tx', `${(e.clientX - r.left - r.width / 2) * 0.2}px`);
                el.style.setProperty('--ty', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
            });
            el.addEventListener('pointerleave', () => {
                el.style.setProperty('--tx', '0px');
                el.style.setProperty('--ty', '0px');
            });
        });

        // ---------- Halo dourado que segue o cursor ----------
        const halo = document.createElement('div');
        halo.className = 'cursor-halo';
        document.body.appendChild(halo);
        let tx = -500, ty = -500, cx = tx, cy = ty;
        window.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
        const followCursor = () => {
            cx += (tx - cx) * 0.12;
            cy += (ty - cy) * 0.12;
            halo.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
            requestAnimationFrame(followCursor);
        };
        followCursor();
    }

    // ---------- Contadores ----------
    const counters = document.querySelectorAll('[data-count]');
    const formatCount = (el, value) => `${el.dataset.prefix || ''}${value}${el.dataset.suffix || ''}`;
    if (!reduced) counters.forEach(el => { el.textContent = formatCount(el, 0); });

    const countObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const el = entry.target;
            const end = parseFloat(el.dataset.count);
            if (reduced) {
                el.textContent = formatCount(el, end);
                return;
            }
            const duration = 1600;
            const start = performance.now();
            const step = now => {
                const p = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 3);
                el.textContent = formatCount(el, Math.round(end * eased));
                if (p < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        });
    }, { threshold: 0.6 });
    counters.forEach(el => countObserver.observe(el));

    // ---------- Animações ligadas à rolagem (GSAP) ----------
    const stepsFill = document.querySelector('.steps-line-fill');
    if (hasGSAP && !reduced) {
        gsap.to(stepsFill, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: '#como-funciona', start: 'top 65%', end: 'bottom 75%', scrub: 0.6 },
        });

        gsap.to('.hero-copy', {
            yPercent: -12,
            opacity: 0.2,
            ease: 'none',
            scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true },
        });

        gsap.utils.toArray('[data-parallax]').forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.2;
            gsap.fromTo(el, { y: () => -speed * 100 }, {
                y: () => speed * 100,
                ease: 'none',
                scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
            });
        });
    } else if (stepsFill) {
        stepsFill.style.transform = 'scaleX(1)';
    }

    // ---------- FAQ com abertura animada ----------
    document.querySelectorAll('.faq-item').forEach(item => {
        const summary = item.querySelector('summary');
        const body = item.querySelector('.faq-body');
        item.classList.toggle('is-open', item.open);

        summary.addEventListener('click', e => {
            e.preventDefault();
            if (item.open) {
                item.classList.remove('is-open');
                const anim = body.animate(
                    [{ height: `${body.offsetHeight}px`, opacity: 1 }, { height: '0px', opacity: 0 }],
                    { duration: reduced ? 0 : 300, easing: 'ease' }
                );
                anim.onfinish = () => { item.open = false; };
            } else {
                item.open = true;
                item.classList.add('is-open');
                body.animate(
                    [{ height: '0px', opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }],
                    { duration: reduced ? 0 : 380, easing: 'cubic-bezier(.2,.8,.2,1)' }
                );
            }
        });
    });

    // ---------- Chat simulado no hero ----------
    const chatBody = document.getElementById('chat-body');
    const chatStatus = document.getElementById('chat-status');
    if (chatBody) {
        const conversation = [
            { from: 'user', text: 'Oi! Como posso diluir Lavanda para usar na pele?' },
            { from: 'bot', text: 'Olá! 🌿 Para adultos, misture 1 a 2 gotas de Lavanda em 1 colher (chá) de óleo de coco fracionado e aplique na área desejada.' },
            { from: 'user', text: 'E para relaxar antes de dormir?' },
            { from: 'bot', text: 'Difunda 3 a 4 gotas de Lavanda no difusor cerca de 30 min antes de deitar. Fica ainda melhor combinada com Cedro ✨' },
        ];
        const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
        const time = () => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const addBubble = (cls, html) => {
            const bubble = document.createElement('div');
            bubble.className = `bubble ${cls}`;
            bubble.innerHTML = html;
            chatBody.appendChild(bubble);
            return bubble;
        };

        const runChat = async () => {
            for (;;) {
                for (const msg of conversation) {
                    if (msg.from === 'user') {
                        await wait(900);
                        addBubble('user', `${msg.text}<time>${time()}<i class="fa-solid fa-check-double ticks"></i></time>`);
                    } else {
                        await wait(500);
                        chatStatus.textContent = 'digitando…';
                        const typing = addBubble('bot typing', '<span></span><span></span><span></span>');
                        await wait(1600);
                        typing.remove();
                        chatStatus.textContent = 'online';
                        addBubble('bot', `${msg.text}<time>${time()}</time>`);
                        await wait(1400);
                    }
                }
                await wait(4500);
                chatBody.classList.add('is-clearing');
                await wait(600);
                chatBody.innerHTML = '';
                chatBody.classList.remove('is-clearing');
                await wait(400);
            }
        };
        runChat();
    }
})();
