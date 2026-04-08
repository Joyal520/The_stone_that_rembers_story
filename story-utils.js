
(function () {
    // --- Configuration ---
    const SPLASH_IMAGE = 'flashscreen.jpg';
    const SPLASH_DURATION = 3000;
    const FADE_DURATION = 1000;

    // --- Styles ---
    const styles = `
        #story-splash-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
            transition: opacity ${FADE_DURATION}ms ease;
            pointer-events: none; 
        }
        
        #story-splash-overlay img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            animation: splashZoom ${SPLASH_DURATION + FADE_DURATION}ms ease-out forwards;
        }

        #story-splash-overlay .loading-bar-container {
            position: absolute;
            bottom: 50px;
            left: 50%;
            transform: translateX(-50%);
            width: 200px;
            height: 4px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 2px;
            overflow: hidden;
        }

        #story-splash-overlay .loading-bar {
            width: 0%;
            height: 100%;
            background: #d4af37; 
            box-shadow: 0 0 10px #d4af37;
            animation: loadProgress ${SPLASH_DURATION}ms linear forwards;
        }

        /* Starry Background */
        #star-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            opacity: 0;
            transition: opacity 1s ease;
        }
        
        body:not(.theme-light) #star-canvas {
            opacity: 1;
        }

        /* Double-Tap Highlight */
        .story-card.card-highlight {
            background-color: rgba(255, 255, 255, 0.95) !important;
            color: #1a1a1a !important;
            transform: scale(1.02);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }
        
        .story-card.card-highlight p {
            color: #1a1a1a !important;
            text-shadow: none !important;
        }

        @keyframes splashZoom {
            0% { transform: scale(1.0); }
            100% { transform: scale(1.05); }
        }

        @keyframes loadProgress {
            0% { width: 0%; }
            100% { width: 100%; }
        }
    `;

    // --- Starry Background Logic ---
    function initStars() {
        if (document.getElementById('star-canvas')) return;
        const canvas = document.createElement('canvas');
        canvas.id = 'star-canvas';
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let stars = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            stars = [];
            for (let i = 0; i < 300; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 1.5,
                    alpha: Math.random(),
                    speed: (Math.random() - 0.5) * 0.01
                });
            }
        };

        window.addEventListener('resize', resize);
        resize();

        function animateStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";

            stars.forEach(star => {
                star.alpha += star.speed;
                if (star.alpha >= 1) { star.alpha = 1; star.speed *= -1; }
                if (star.alpha <= 0.2) { star.alpha = 0.2; star.speed *= -1; }

                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animateStars);
        }
        animateStars();
    }

    // --- Double Tap Logic ---
    function initInteraction() {
        const cards = document.querySelectorAll('.story-card');
        let lastTap = 0;

        cards.forEach(card => {
            card.addEventListener('dblclick', () => {
                card.classList.toggle('card-highlight');
            });

            card.addEventListener('touchend', (e) => {
                const currentTime = new Date().getTime();
                const tapLength = currentTime - lastTap;
                if (tapLength < 300 && tapLength > 0) {
                    card.classList.toggle('card-highlight');
                    e.preventDefault();
                }
                lastTap = currentTime;
            });
        });
    }

    // --- Global Read Story ---
    let currentUtteranceIndex = 0;
    let storySteps = [];

    window.readStory = function () {
        const btn = document.getElementById('narrateBtn');
        const synth = window.speechSynthesis;

        if (window.isNarrating) {
            synth.cancel();
            window.isNarrating = false;
            if (btn) btn.innerText = "Narrate (Natural)";
            return;
        }

        // Just in case anything is lingering
        synth.cancel();
        window.isNarrating = true;
        if (btn) btn.innerText = "Stop Narration";

        storySteps = [];
        // Support both old and new card structures
        const contentSources = document.querySelectorAll('.story-card, .modal-body, #content-target');
        
        const splitIntoSentences = (text) => {
            const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
            const result = [];
            let buffer = '';
            sentences.forEach(s => {
                const trimmed = s.trim();
                if (!trimmed) return;
                if (/[.!?]$/.test(trimmed)) {
                    if (buffer) {
                        result.push(buffer + ' ' + trimmed);
                        buffer = '';
                    } else {
                        result.push(trimmed);
                    }
                } else {
                    buffer = buffer ? buffer + ' ' + trimmed : trimmed;
                }
            });
            if (buffer) result.push(buffer);
            return result.length ? result : [text];
        };

        const getBestVoice = () => {
            const voices = synth.getVoices();
            const preferred = ['Google US English', 'Microsoft Zira', 'Samantha', 'Alex'];
            return voices.find(v => preferred.some(p => v.name.includes(p))) || voices[0];
        };

        contentSources.forEach(source => {
            const paragraphs = source.querySelectorAll('p');
            paragraphs.forEach(p => {
                let rate = 0.9, pitch = 1.0, volume = 1.0;

                if (p.classList.contains('danger') || p.innerText === p.innerText.toUpperCase()) {
                    rate = 1.15; pitch = 1.1;
                } else if (p.classList.contains('whisper') || p.classList.contains('italic')) {
                    rate = 0.85; pitch = 0.85; volume = 0.8;
                }

                const sentences = splitIntoSentences(p.innerText);
                sentences.forEach(s => {
                    const clean = s.trim().replace(/\s+/g, ' ');
                    if (clean.length > 1) {
                        storySteps.push({ text: clean, rate, pitch, volume });
                    }
                });
            });
        });

        const speakStep = (index) => {
            if (!window.isNarrating || index >= storySteps.length) {
                window.isNarrating = false;
                if (btn) btn.innerText = "Narrate (Natural)";
                return;
            }

            const step = storySteps[index];
            const utterance = new SpeechSynthesisUtterance(step.text);
            utterance.voice = getBestVoice();
            utterance.rate = step.rate;
            utterance.pitch = step.pitch;
            utterance.volume = step.volume;

            utterance.onend = () => {
                if (!window.isNarrating) return;
                setTimeout(() => speakStep(index + 1), 500); // 500ms pause between sentences
            };

            utterance.onerror = (e) => {
                console.error("Speech error", e);
                if (window.isNarrating) setTimeout(() => speakStep(index + 1), 500);
            };

            synth.speak(utterance);
        };

        if (synth.getVoices().length === 0) {
            synth.onvoiceschanged = () => speakStep(0);
        } else {
            speakStep(0);
        }
    };

    // --- Theme & Layout Init ---
    function initApp() {
        // Apply Light Theme by Default unless explicitly told otherwise
        if (!document.body.classList.contains('theme-light') && !document.body.classList.contains('theme-dark-override')) {
            document.body.classList.add('theme-light');
        }

        // Inject Styles
        if (!document.getElementById('story-utils-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'story-utils-styles';
            styleEl.textContent = styles;
            document.head.appendChild(styleEl);
        }

        initStars();
        initInteraction();

        // Splash Logic
        const path = window.location.pathname;
        const page = path.split("/").pop().toLowerCase();

        if (page.includes('chapter1.html') || page.includes('frontcover') || page === '' || page === 'index.html') {
            return;
        }

        if (document.getElementById('story-splash-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'story-splash-overlay';

        const img = document.createElement('img');
        img.src = SPLASH_IMAGE;
        img.alt = "Loading...";

        const barContainer = document.createElement('div');
        barContainer.className = 'loading-bar-container';
        const bar = document.createElement('div');
        bar.className = 'loading-bar';
        barContainer.appendChild(bar);

        overlay.appendChild(img);
        overlay.appendChild(barContainer);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
            }, FADE_DURATION);
        }, SPLASH_DURATION);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();
