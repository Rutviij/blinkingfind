let allItems = [];
let currentFilter = 'all';

async function loadItems(status = 'all') {
    try {
        let query = supabase
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });

        if (status !== 'all') {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;

        allItems = data || [];
        renderTable();
    } catch (error) {
        console.error('Error loading items:', error);
        showNoItems();
    }
}

function renderTable() {
    const tbody = document.getElementById('itemsTableBody');
    const noItems = document.getElementById('noItems');

    if (allItems.length === 0) {
        showNoItems();
        return;
    }

    noItems.style.display = 'none';
    tbody.innerHTML = '';

    allItems.forEach(item => {
        const row = createTableRow(item);
        tbody.appendChild(row);
    });
}

function createTableRow(item) {
    const row = document.createElement('tr');

    const date = new Date(item.date_found).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const statusClass = `status-${item.status}`;
    const statusText = item.status.charAt(0).toUpperCase() + item.status.slice(1);

    let actionButtons = '';
    if (item.status === 'pending') {
        actionButtons = `
            <button class="action-btn btn-approve" onclick="approveItem('${item.id}')">Approve</button>
            <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
        `;
    } else {
        actionButtons = `
            <button class="action-btn btn-view" onclick="viewItem('${item.id}')">View Details</button>
            <button class="action-btn btn-delete" onclick="deleteItem('${item.id}')">Delete</button>
        `;
    }

    row.innerHTML = `
        <td>${date}</td>
        <td><strong>${item.title}</strong></td>
        <td>${item.category}</td>
        <td>${item.location_found}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${item.finder_name}</td>
        <td>
            <div class="action-buttons">
                ${actionButtons}
            </div>
        </td>
    `;

    return row;
}

function showNoItems() {
    document.getElementById('itemsTableBody').innerHTML = '';
    document.getElementById('noItems').style.display = 'block';
}

async function approveItem(itemId) {
    if (!confirm('Approve this item to make it visible to students?')) return;

    try {
        const { data, error } = await supabase
            .from('items')
            .update({ status: 'approved', updated_at: new Date().toISOString() })
            .eq('id', itemId)
            .select();

        if (error) throw error;

        alert('Item approved successfully!');
        loadItems(currentFilter);
    } catch (error) {
        console.error('Error approving item:', error);
        alert('Error approving item. Please try again.');
    }
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;

    try {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        alert('Item deleted successfully!');
        loadItems(currentFilter);
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item. Please try again.');
    }
}

function viewItem(itemId) {
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('viewModal');
    const content = document.getElementById('modalContent');

    const imageHtml = item.photo_url
        ? `<img src="${item.photo_url}" alt="${item.title}" class="modal-image">`
        : '';

    const dateFound = new Date(item.date_found).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const dateCreated = new Date(item.created_at).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let claimInfoHtml = '';
    if (item.status === 'claimed' && item.claimed_by) {
        claimInfoHtml = `
            <div class="claim-info">
                <h3>Claim Information</h3>
                <div class="detail-row">
                    <div class="detail-label">Claimed By:</div>
                    <div class="detail-value">${item.claimed_by}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Contact:</div>
                    <div class="detail-value">${item.claim_contact || 'N/A'}</div>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                    <div class="detail-label">Message:</div>
                    <div class="detail-value">${item.claim_message || 'N/A'}</div>
                </div>
            </div>
        `;
    }

    content.innerHTML = `
        ${imageHtml}
        <h2 class="modal-title">${item.title}</h2>

        <div class="detail-row">
            <div class="detail-label">Category:</div>
            <div class="detail-value">${item.category}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Description:</div>
            <div class="detail-value">${item.description}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Location Found:</div>
            <div class="detail-value">${item.location_found}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Date Found:</div>
            <div class="detail-value">${dateFound}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Status:</div>
            <div class="detail-value"><span class="status-badge status-${item.status}">${item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span></div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Finder Name:</div>
            <div class="detail-value">${item.finder_name}</div>
        </div>
        <div class="detail-row">
            <div class="detail-label">Finder Contact:</div>
            <div class="detail-value">${item.finder_contact}</div>
        </div>
        <div class="detail-row" style="border-bottom: none;">
            <div class="detail-label">Reported On:</div>
            <div class="detail-value">${dateCreated}</div>
        </div>
        ${claimInfoHtml}
    `;

    modal.classList.add('active');
}

function closeViewModal() {
    const modal = document.getElementById('viewModal');
    modal.classList.remove('active');
}

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        currentFilter = this.dataset.status;
        loadItems(currentFilter);
    });
});

document.addEventListener('DOMContentLoaded', () => loadItems());
