(function () {
    const s = document.createElement('script');
    s.src = 'https://tally.so/widgets/embed.js';
    s.async = true;
    s.onload = () => window.Tally?.loadEmbeds?.();
    document.head.appendChild(s);
})();
