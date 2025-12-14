let allItems = [];
let filteredItems = [];

async function loadItems() {
    try {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allItems = data || [];
        filteredItems = allItems;
        renderItems();
    } catch (error) {
        console.error('Error loading items:', error);
        showNoItems();
    }
}

function renderItems() {
    const grid = document.getElementById('itemsGrid');
    const noItems = document.getElementById('noItems');

    if (filteredItems.length === 0) {
        showNoItems();
        return;
    }

    noItems.style.display = 'none';
    grid.innerHTML = '';

    filteredItems.forEach(item => {
        const card = createItemCard(item);
        grid.appendChild(card);
    });
}

function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';

    const imageHtml = item.photo_url
        ? `<img src="${item.photo_url}" alt="${item.title}">`
        : `<div style="font-size: 64px;">${getCategoryEmoji(item.category)}</div>`;

    const date = new Date(item.date_found).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    card.innerHTML = `
        <div class="item-image">${imageHtml}</div>
        <div class="item-content">
            <span class="item-category">${item.category}</span>
            <h3 class="item-title">${item.title}</h3>
            <p class="item-description">${item.description}</p>
            <div class="item-details">
                <div class="item-detail">📍 ${item.location_found}</div>
                <div class="item-detail">📅 ${date}</div>
            </div>
            <button class="claim-btn" onclick="openClaimModal('${item.id}')">Claim This Item</button>
        </div>
    `;

    return card;
}

function getCategoryEmoji(category) {
    const emojis = {
        'Electronics': '📱',
        'Clothing': '👕',
        'Books': '📚',
        'Sports': '⚽',
        'Keys': '🔑',
        'Bags': '🎒',
        'Other': '📦'
    };
    return emojis[category] || '📦';
}

function showNoItems() {
    document.getElementById('itemsGrid').innerHTML = '';
    document.getElementById('noItems').style.display = 'block';
}

document.getElementById('searchInput').addEventListener('input', filterItems);
document.getElementById('categoryFilter').addEventListener('change', filterItems);

function filterItems() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    filteredItems = allItems.filter(item => {
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                            item.description.toLowerCase().includes(searchTerm) ||
                            item.location_found.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || item.category === category;

        return matchesSearch && matchesCategory;
    });

    renderItems();
}

function openClaimModal(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('claimModal');
    const details = document.getElementById('modalItemDetails');

    const imageHtml = item.photo_url
        ? `<img src="${item.photo_url}" alt="${item.title}" style="width: 100%; border-radius: 12px; margin-bottom: 20px;">`
        : '';

    const date = new Date(item.date_found).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    details.innerHTML = `
        ${imageHtml}
        <div style="margin-bottom: 20px;">
            <span class="item-category">${item.category}</span>
            <h3 style="font-size: 24px; color: #473472; margin: 10px 0;">${item.title}</h3>
            <p style="color: #53629E; margin-bottom: 15px;">${item.description}</p>
            <div style="color: #53629E; font-size: 14px;">
                <div style="margin-bottom: 8px;">📍 Found at: ${item.location_found}</div>
                <div>📅 Date found: ${date}</div>
            </div>
        </div>
    `;

    document.getElementById('claimItemId').value = itemId;
    modal.classList.add('active');
}

function closeClaimModal() {
    const modal = document.getElementById('claimModal');
    modal.classList.remove('active');
    document.getElementById('claimForm').reset();
}

document.getElementById('claimForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const itemId = document.getElementById('claimItemId').value;
    const claimerName = document.getElementById('claimerName').value;
    const claimerContact = document.getElementById('claimerContact').value;
    const claimMessage = document.getElementById('claimMessage').value;

    try {
        const { data, error } = await supabase
            .from('items')
            .update({
                status: 'claimed',
                claimed_by: claimerName,
                claim_contact: claimerContact,
                claim_message: claimMessage,
                updated_at: new Date().toISOString()
            })
            .eq('id', itemId)
            .select();

        if (error) throw error;

        alert('Claim submitted successfully! The finder will be notified.');
        closeClaimModal();
        loadItems();
    } catch (error) {
        console.error('Error submitting claim:', error);
        alert('Error submitting claim. Please try again.');
    }
});

document.addEventListener('DOMContentLoaded', loadItems);
