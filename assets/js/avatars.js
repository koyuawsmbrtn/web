document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('avatars');
    if (!gridContainer) {
        console.error('Could not find element with id "avatars"');
        return;
    }

    gridContainer.className = 'avatars-grid';

    fetch('/assets/data/avatars.json')
        .then(response => response.json())
        .then(avatars => {
            avatars.forEach(avatar => {
                const profileLink = document.createElement('a');
                profileLink.href = avatar.url;
                profileLink.target = '_blank';
                profileLink.rel = 'noopener noreferrer';
                profileLink.className = 'profile-link';

                const imageContainer = document.createElement('div');
                imageContainer.className = 'profile-image-container';

                const img = document.createElement('img');
                img.alt = avatar.name;
                img.loading = 'lazy';
                img.width = 200;
                img.height = 200;
                img.decoding = 'async';
                img.className = 'w-full h-full object-cover bg-muted';
                img.src = avatar.imageUrl;

                imageContainer.appendChild(img);
                profileLink.appendChild(imageContainer);
                gridContainer.appendChild(profileLink);
            });
        })
        .catch(error => console.error('Error loading avatars:', error));
});