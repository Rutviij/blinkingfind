let photoFile = null;

document.getElementById('photo').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        photoFile = file;
        const reader = new FileReader();
        reader.onload = function(event) {
            const preview = document.getElementById('photoPreview');
            preview.innerHTML = `<img src="${event.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('dateFound').max = new Date().toISOString().split('T')[0];

document.getElementById('reportForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const messageDiv = document.getElementById('message');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    messageDiv.style.display = 'none';

    try {
        let photoUrl = null;

        if (photoFile) {
            const fileExt = photoFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `items/${fileName}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('lost-found-photos')
                .upload(filePath, photoFile);

            if (uploadError) {
                console.warn('Photo upload failed, continuing without photo:', uploadError);
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from('lost-found-photos')
                    .getPublicUrl(filePath);
                photoUrl = publicUrl;
            }
        }

        const formData = {
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            description: document.getElementById('description').value,
            location_found: document.getElementById('locationFound').value,
            date_found: document.getElementById('dateFound').value,
            photo_url: photoUrl,
            finder_name: document.getElementById('finderName').value,
            finder_contact: document.getElementById('finderContact').value,
            status: 'pending'
        };

        const { data, error } = await supabase
            .from('items')
            .insert([formData])
            .select();

        if (error) throw error;

        messageDiv.className = 'message success';
        messageDiv.textContent = 'Item reported successfully! It will be visible once approved by an administrator.';
        messageDiv.style.display = 'block';

        document.getElementById('reportForm').reset();
        document.getElementById('photoPreview').innerHTML = '';
        photoFile = null;

        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);

    } catch (error) {
        console.error('Error submitting form:', error);
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Error submitting report. Please try again.';
        messageDiv.style.display = 'block';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Report';
    }
});
