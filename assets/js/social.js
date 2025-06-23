document.addEventListener('DOMContentLoaded', () => {
    const socialContainer = document.getElementById('social');
    if (!socialContainer) {
        console.error('Could not find element with id "social"');
        return;
    }

    socialContainer.className = 'social-icons';

    fetch('/assets/data/social.json')
        .then(response => response.json())
        .then(icons => {
            icons.forEach(icon => {
                const link = document.createElement('a');
                link.href = icon.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer me';
                link.className = 'social-link';
                link.setAttribute('aria-label', icon.name);

                const img = document.createElement('img');
                img.src = `/assets/img/icons/${icon.name}.svg`;
                img.className = 'social-icon';
                img.alt = '';
                img.setAttribute('aria-hidden', 'true');

                link.appendChild(img);
                socialContainer.appendChild(link);
            });
        })
        .catch(error => console.error('Error loading social icons:', error));
});