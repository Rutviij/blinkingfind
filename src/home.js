async function loadStats() {
    try {
        const { data: allItems, error: allError } = await supabase
            .from('items')
            .select('*');

        if (allError) throw allError;

        const totalItems = allItems.length;
        const itemsClaimed = allItems.filter(item => item.status === 'claimed').length;
        const activeItems = allItems.filter(item => item.status === 'approved').length;

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('itemsClaimed').textContent = itemsClaimed;
        document.getElementById('activeItems').textContent = activeItems;

        animateNumbers();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function animateNumbers() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let current = 0;
        const increment = target / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = Math.floor(current);
            }
        }, 30);
    });
}

document.addEventListener('DOMContentLoaded', loadStats);
