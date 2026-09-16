/**
 * UKAASHA & HAANIYA - OUR PRIVATE SANCTUARY
 * Main Application Logic & Interactivity
 * Strictly Enforces Private Access & Gatekeeper Lock
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. STATE & SERVICE REFERENCES ---
    const service = window.relationshipService;
    let currentMemoryFilter = 'All';
    let currentNoteFilter = 'All';
    let isSignUpMode = false;
    let currentUser = null;

    // --- 3. UI ELEMENTS ---
    // Gate / Lock Screen Elements
    const privateGateScreen = document.getElementById('privateGateScreen');
    const unlockedApp = document.getElementById('unlockedApp');
    const gateAuthForm = document.getElementById('gateAuthForm');
    const gateEmail = document.getElementById('gateEmail');
    const gatePassword = document.getElementById('gatePassword');
    const gateSubmitBtn = document.getElementById('gateSubmitBtn');

    // Navbar & Auth
    const authStatusPill = document.getElementById('vaultStatusPill');
    const authDot = document.getElementById('authDot');
    const authStatusText = document.getElementById('authStatusText');
    const authActionBtn = document.getElementById('authActionBtn');
    const openSettingsBtn = document.getElementById('openSettingsBtn');

    // Live Counter
    const counterDays = document.getElementById('counterDays');
    const counterHours = document.getElementById('counterHours');
    const counterMins = document.getElementById('counterMins');
    const counterSecs = document.getElementById('counterSecs');
    const anniversaryLabel = document.getElementById('anniversaryLabel');
    const editAnniversaryTrigger = document.getElementById('editAnniversaryTrigger');

    // Memories
    const memoriesGrid = document.getElementById('memoriesGrid');
    const memoryFilterTabs = document.getElementById('memoryFilterTabs');
    const openAddMemoryModalBtn = document.getElementById('openAddMemoryModalBtn');
    const heroAddMemoryBtn = document.getElementById('heroAddMemoryBtn');
    const addMemoryForm = document.getElementById('addMemoryForm');
    const fileDropZone = document.getElementById('fileDropZone');
    const memoryFileInput = document.getElementById('memoryFileInput');
    const uploadPreview = document.getElementById('uploadPreview');
    const memoryUrlInput = document.getElementById('memoryUrlInput');

    // Notes
    const notesContainer = document.getElementById('notesContainer');
    const notesFilterTabs = document.getElementById('notesFilterTabs');
    const openAddNoteModalBtn = document.getElementById('openAddNoteModalBtn');
    const addNoteForm = document.getElementById('addNoteForm');

    // Lightbox
    const lightboxModal = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxCategory = document.getElementById('lightboxCategory');
    const lightboxDate = document.getElementById('lightboxDate');
    const lightboxCaption = document.getElementById('lightboxCaption');

    // Modals
    const addMemoryModal = document.getElementById('addMemoryModal');
    const addNoteModal = document.getElementById('addNoteModal');
    const supabaseSettingsModal = document.getElementById('supabaseSettingsModal');
    const anniversaryModal = document.getElementById('anniversaryModal');

    // --- 4. MODAL MANAGEMENT UTILITIES ---
    function openModal(modal) {
        if (!modal) return;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }

    // Attach close triggers to backdrop and close buttons
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-close');
            if (targetId) closeModal(document.getElementById(targetId));
        });
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop.open').forEach(m => closeModal(m));
        }
    });

    // --- 5. TOAST NOTIFICATIONS ---
    function showToast(message, icon = '💖') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(15px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }

    // --- 6. RELATIONSHIP LIVE COUNTER ---
    function updateRelationshipCounter() {
        const startDateStr = service.getAnniversaryDate();
        const start = new Date(startDateStr);
        const now = new Date();

        if (isNaN(start.getTime())) return;

        // Calculate difference in milliseconds
        let diff = Math.max(0, now.getTime() - start.getTime());

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        diff -= days * (1000 * 60 * 60 * 24);

        const hours = Math.floor(diff / (1000 * 60 * 60));
        diff -= hours * (1000 * 60 * 60);

        const minutes = Math.floor(diff / (1000 * 60));
        diff -= minutes * (1000 * 60);

        const seconds = Math.floor(diff / 1000);

        if (counterDays) counterDays.textContent = days.toLocaleString();
        if (counterHours) counterHours.textContent = String(hours).padStart(2, '0');
        if (counterMins) counterMins.textContent = String(minutes).padStart(2, '0');
        if (counterSecs) counterSecs.textContent = String(seconds).padStart(2, '0');

        if (anniversaryLabel) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            anniversaryLabel.textContent = `Since ${start.toLocaleDateString(undefined, options)}`;
        }
    }

    setInterval(updateRelationshipCounter, 1000);
    updateRelationshipCounter();

    // Edit Anniversary Date
    if (editAnniversaryTrigger) {
        editAnniversaryTrigger.addEventListener('click', () => {
            const current = service.getAnniversaryDate();
            const input = document.getElementById('anniversaryInput');
            try {
                const d = new Date(current);
                const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                input.value = iso;
            } catch (e) {
                input.value = '2024-06-01T00:00';
            }
            openModal(anniversaryModal);
        });
    }

    document.getElementById('anniversaryForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('anniversaryInput').value;
        if (val) {
            service.setAnniversaryDate(val);
            updateRelationshipCounter();
            closeModal(anniversaryModal);
            showToast('Anniversary milestone updated!', '💍');
        }
    });

    // --- 7. STRICT AUTHENTICATION & GATEKEEPER LOGIC ---
    async function checkSanctuaryAccess() {
        currentUser = await service.getCurrentUser();
        if (currentUser) {
            unlockSanctuary(currentUser);
        } else {
            lockSanctuary();
        }
    }

    function unlockSanctuary(user) {
        currentUser = user;
        privateGateScreen.classList.add('unlocked');
        unlockedApp.style.display = 'block';

        const isConfigured = service.isSupabaseConfigured();
        if (isConfigured) {
            authDot.className = 'auth-dot';
            authStatusText.textContent = `Cloud: ${user.name}`;
        } else {
            authDot.className = 'auth-dot offline';
            authStatusText.textContent = `Vault: ${user.name}`;
        }

        authActionBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Lock</span>
        `;
        authActionBtn.onclick = handleLockSanctuary;

        // Render private contents
        renderMemories();
        renderNotes();
        updateRelationshipCounter();
    }

    async function handleLockSanctuary() {
        await service.signOut();
        lockSanctuary();
        showToast('Sanctuary locked. Access restricted.', '🔒');
    }

    function lockSanctuary() {
        currentUser = null;
        privateGateScreen.classList.remove('unlocked');
        unlockedApp.style.display = 'none';
        if (memoriesGrid) memoriesGrid.innerHTML = '';
        if (notesContainer) notesContainer.innerHTML = '';
        gateAuthForm.reset();
    }

    // Gate login form submission
    gateAuthForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = gateEmail.value.trim();
        const password = gatePassword.value;

        gateSubmitBtn.disabled = true;
        const btnSpan = gateSubmitBtn.querySelector('span');
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Verifying credentials...';

        try {
            const user = await service.signIn(email, password);
            showToast(`Welcome back, ${user.name || 'beloved'}!`, '💖');
            unlockSanctuary(user);
        } catch (err) {
            showToast(err.message || 'Authentication error', '❌');
        } finally {
            gateSubmitBtn.disabled = false;
            btnSpan.textContent = originalText;
        }
    });

    // Supabase Settings Triggers (in navbar)
    const openSupabaseSettings = () => {
        const config = service.config;
        document.getElementById('supabaseUrl').value = config.url || '';
        document.getElementById('supabaseAnonKey').value = config.key || '';
        openModal(supabaseSettingsModal);
    };

    openSettingsBtn.addEventListener('click', openSupabaseSettings);
    authStatusPill.addEventListener('click', openSupabaseSettings);

    document.getElementById('supabaseConfigForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const url = document.getElementById('supabaseUrl').value;
        const key = document.getElementById('supabaseAnonKey').value;

        if (url && key) {
            service.saveConfig(url, key);
            showToast('Supabase cloud linked!', '☁️');
            closeModal(supabaseSettingsModal);
            checkSanctuaryAccess();
        } else {
            showToast('Please enter both Supabase URL and Key', '⚠️');
        }
    });

    document.getElementById('disconnectSupabaseBtn').addEventListener('click', () => {
        service.clearConfig();
        showToast('Switched to Local Demo Mode', '📁');
        closeModal(supabaseSettingsModal);
        checkSanctuaryAccess();
    });

    // --- 8. MEMORIES LOGIC (IMAGE STORAGE & GALLERY) ---
    async function renderMemories() {
        if (!currentUser) return; // Prevent rendering if not logged in

        memoriesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                Gathering our cherished moments...
            </div>
        `;

        try {
            const memories = await service.getMemories();
            const filtered = currentMemoryFilter === 'All' 
                ? memories 
                : memories.filter(m => m.category === currentMemoryFilter);

            if (filtered.length === 0) {
                memoriesGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📸</div>
                        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 8px;">No Memories in "${currentMemoryFilter}" Yet</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Be the first to upload a moment for this category.</p>
                        <button class="btn btn-rose btn-sm" onclick="document.getElementById('openAddMemoryModalBtn').click()">+ Add Moment</button>
                    </div>
                `;
                return;
            }

            memoriesGrid.innerHTML = '';
            filtered.forEach(memory => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                
                const formattedDate = memory.memory_date 
                    ? new Date(memory.memory_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '';

                card.innerHTML = `
                    <div class="memory-img-wrapper">
                        <img src="${escapeHtml(memory.image_url)}" class="memory-img" alt="${escapeHtml(memory.title)}" loading="lazy">
                        <span class="memory-category-tag">${escapeHtml(memory.category || 'Moments')}</span>
                    </div>
                    <div class="memory-content">
                        <span class="memory-date">${formattedDate}</span>
                        <h3 class="memory-title">${escapeHtml(memory.title)}</h3>
                        <p class="memory-caption">${escapeHtml(memory.caption || '')}</p>
                    </div>
                `;

                // Open lightbox on card click
                card.addEventListener('click', () => {
                    openLightbox(memory);
                });

                memoriesGrid.appendChild(card);
            });
        } catch (err) {
            memoriesGrid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: red;">Error loading memories.</div>`;
        }
    }

    // Lightbox View
    function openLightbox(memory) {
        lightboxImg.src = memory.image_url;
        lightboxTitle.textContent = memory.title;
        lightboxCategory.textContent = memory.category || 'Moments';
        lightboxDate.textContent = memory.memory_date 
            ? new Date(memory.memory_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) 
            : '';
        lightboxCaption.textContent = memory.caption || '';
        openModal(lightboxModal);
    }

    // Memory Filter Tabs
    memoryFilterTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        memoryFilterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMemoryFilter = btn.getAttribute('data-filter');
        renderMemories();
    });

    // Add Memory Trigger
    const triggerAddMemory = () => {
        addMemoryForm.reset();
        uploadPreview.style.display = 'none';
        uploadPreview.src = '';
        document.getElementById('memoryDate').value = new Date().toISOString().split('T')[0];
        openModal(addMemoryModal);
    };

    openAddMemoryModalBtn.addEventListener('click', triggerAddMemory);
    heroAddMemoryBtn.addEventListener('click', triggerAddMemory);

    // Image File Drop & Selection
    fileDropZone.addEventListener('click', () => memoryFileInput.click());

    fileDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        fileDropZone.classList.add('dragover');
    });

    fileDropZone.addEventListener('dragleave', () => {
        fileDropZone.classList.remove('dragover');
    });

    fileDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        fileDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleSelectedFile(e.dataTransfer.files[0]);
        }
    });

    memoryFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleSelectedFile(e.target.files[0]);
        }
    });

    function handleSelectedFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file', '⚠️');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadPreview.src = e.target.result;
            uploadPreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    // Add Memory Form Submit
    addMemoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('saveMemoryBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving to Vault...';

        try {
            const title = document.getElementById('memoryTitle').value;
            const category = document.getElementById('memoryCategory').value;
            const date = document.getElementById('memoryDate').value;
            const caption = document.getElementById('memoryCaption').value;
            const file = memoryFileInput.files[0];
            const directUrl = memoryUrlInput.value;

            if (!file && !directUrl) {
                showToast('Please upload a photo or provide an image URL', '⚠️');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save to Our Vault';
                return;
            }

            await service.addMemory({
                title,
                caption,
                category,
                memory_date: date,
                image_file: file,
                image_url: directUrl
            });

            showToast('Memory immortalized in our vault!', '📷');
            closeModal(addMemoryModal);
            renderMemories();
        } catch (err) {
            showToast(err.message || 'Failed to save memory', '❌');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Save to Our Vault';
        }
    });

    // --- 9. NOTES LOGIC (LOVE LETTERS & REMINDERS) ---
    async function renderNotes() {
        if (!currentUser) return; // Prevent rendering if not logged in

        notesContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                Reading our love letters...
            </div>
        `;

        try {
            const notes = await service.getNotes();
            let filtered = notes;

            if (currentNoteFilter === 'Ukaasha') {
                filtered = notes.filter(n => (n.author || '').toLowerCase() === 'ukaasha');
            } else if (currentNoteFilter === 'Haaniya') {
                filtered = notes.filter(n => (n.author || '').toLowerCase() === 'haaniya');
            } else if (currentNoteFilter === 'Pinned') {
                filtered = notes.filter(n => n.is_pinned);
            }

            if (filtered.length === 0) {
                notesContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">💌</div>
                        <h3 style="font-family: var(--font-serif); font-size: 1.6rem; margin-bottom: 8px;">No Letters Found</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 16px;">Write a sweet note to brighten each other's day.</p>
                        <button class="btn btn-rose btn-sm" onclick="document.getElementById('openAddNoteModalBtn').click()">+ Write Letter</button>
                    </div>
                `;
                return;
            }

            notesContainer.innerHTML = '';
            filtered.forEach(note => {
                const card = document.createElement('div');
                card.className = `note-card ${note.is_pinned ? 'pinned' : ''}`;

                const authorClass = (note.author || '').toLowerCase();
                const formattedDate = note.created_at 
                    ? new Date(note.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
                    : '';

                card.innerHTML = `
                    ${note.is_pinned ? `<div class="note-pin-indicator"><span>📌</span> Pinned</div>` : ''}
                    <div class="note-header">
                        <span class="note-author-badge ${authorClass}">From ${escapeHtml(note.author)}</span>
                        <div class="note-actions">
                            <button class="note-btn-icon pin-toggle-btn" title="${note.is_pinned ? 'Unpin Note' : 'Pin Note'}">
                                ${note.is_pinned ? '📌' : '📍'}
                            </button>
                        </div>
                    </div>
                    <h3 class="note-title">${escapeHtml(note.title)}</h3>
                    <div class="note-body">${escapeHtml(note.content)}</div>
                    <div class="note-footer">
                        <span class="note-mood-tag">Mood: ${escapeHtml(note.mood || 'Devoted')}</span>
                        <span>${formattedDate}</span>
                    </div>
                `;

                // Pin / Unpin listener
                const pinBtn = card.querySelector('.pin-toggle-btn');
                pinBtn.addEventListener('click', async () => {
                    await service.toggleNotePin(note.id);
                    renderNotes();
                });

                notesContainer.appendChild(card);
            });
        } catch (err) {
            notesContainer.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: red;">Error loading notes.</div>`;
        }
    }

    // Notes Filter Tabs
    notesFilterTabs.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        notesFilterTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentNoteFilter = btn.getAttribute('data-filter');
        renderNotes();
    });

    // Add Note Modal Trigger
    openAddNoteModalBtn.addEventListener('click', () => {
        addNoteForm.reset();
        if (currentUser && currentUser.name.toLowerCase().includes('haaniya')) {
            document.getElementById('noteAuthor').value = 'Haaniya';
        } else {
            document.getElementById('noteAuthor').value = 'Ukaasha';
        }
        openModal(addNoteModal);
    });

    // Add Note Form Submit
    addNoteForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('saveNoteBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sealing...';

        try {
            const title = document.getElementById('noteTitle').value;
            const author = document.getElementById('noteAuthor').value;
            const mood = document.getElementById('noteMood').value;
            const content = document.getElementById('noteContent').value;
            const isPinned = document.getElementById('notePin').checked;

            await service.addNote({
                title,
                author,
                mood,
                content,
                is_pinned: isPinned
            });

            showToast('Letter sealed and placed in our sanctuary!', '💌');
            closeModal(addNoteModal);
            renderNotes();
        } catch (err) {
            showToast(err.message || 'Failed to save letter', '❌');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Seal & Send Letter';
        }
    });

    // --- 10. NAVBAR SCROLL INTERACTION ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Helper: Escape HTML to avoid XSS
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // --- 12. INITIALIZE GATEKEEPER CHECK ---
    checkSanctuaryAccess();
});
