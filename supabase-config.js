/**
 * UKAASHA & HAANIYA - ROMANTIC VAULT
 * Supabase Integration & Offline/Demo Storage Fallback Engine
 */

// Key for storing custom Supabase credentials in browser localStorage
const STORAGE_KEYS = {
    SUPABASE_CONFIG: 'ukaasha_haaniya_supabase_config',
    LOCAL_MEMORIES: 'ukaasha_haaniya_local_memories',
    LOCAL_NOTES: 'ukaasha_haaniya_local_notes',
    LOCAL_USER: 'ukaasha_haaniya_local_user',
    ANNIVERSARY_DATE: 'ukaasha_haaniya_anniversary_date'
};

// Authorized Couple Credentials
const AUTHORIZED_CREDENTIALS = [
    {
        email: 'ukaashahaaniya@gmail.com',
        password: 'uh@2026',
        name: 'Ukaasha & Haaniya'
    }
];

// Curated starter memories with aesthetic romantic photography
const STARTER_MEMORIES = [
    {
        id: 'mem-1',
        title: 'The Golden Hour Stroll',
        caption: 'Walking barefoot on the shore with your hand in mine. In that moment, I knew forever wouldn’t be enough.',
        image_url: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=85',
        category: 'Trips',
        memory_date: '2024-06-18',
        created_at: new Date('2024-06-18T18:30:00Z').toISOString()
    },
    {
        id: 'mem-2',
        title: 'Whispered Laughter at Café Lumière',
        caption: 'Warm hot chocolate, your radiant smile, and conversations that stretched until the stars took over.',
        image_url: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=85',
        category: 'Sweet Moments',
        memory_date: '2024-09-02',
        created_at: new Date('2024-09-02T14:15:00Z').toISOString()
    },
    {
        id: 'mem-3',
        title: 'Under the Starlit Sky',
        caption: 'We looked up and made a silent wish upon the same shooting star: to hold each other close for all our tomorrows.',
        image_url: 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=85',
        category: 'Milestones',
        memory_date: '2024-11-20',
        created_at: new Date('2024-11-20T22:00:00Z').toISOString()
    },
    {
        id: 'mem-4',
        title: 'Morning Light & Soft Promises',
        caption: 'The quiet beauty of waking up knowing our story is written with sincerity, kindness, and deep devotion.',
        image_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=85',
        category: 'Sweet Moments',
        memory_date: '2025-01-14',
        created_at: new Date('2025-01-14T09:40:00Z').toISOString()
    }
];

// Curated starter notes from Ukaasha & Haaniya
const STARTER_NOTES = [
    {
        id: 'note-1',
        title: 'To My Dearest Haaniya',
        content: 'From the very first day, your grace and kindness illuminated my world. Every dream I have now has your smile woven into it. Thank you for choosing to walk this life with me, hand in hand.',
        author: 'Ukaasha',
        mood: 'Endless Love',
        is_pinned: true,
        created_at: new Date('2024-06-20T10:00:00Z').toISOString()
    },
    {
        id: 'note-2',
        title: 'My Sanctuary, Ukaasha',
        content: 'Whenever the world feels loud, your voice is my peace. Thank you for being my constant protector, my biggest cheerleader, and my safest home. I love you more with every sunrise.',
        author: 'Haaniya',
        mood: 'Pure Gratitude',
        is_pinned: true,
        created_at: new Date('2024-07-15T15:30:00Z').toISOString()
    },
    {
        id: 'note-3',
        title: 'Our Unbreakable Promise',
        content: '1. Never go to sleep without saying "I love you".\n2. Always listen with patience.\n3. Keep laughing together even when we turn ninety years old.',
        author: 'Together',
        mood: 'Our Vows',
        is_pinned: false,
        created_at: new Date('2024-10-05T19:00:00Z').toISOString()
    },
    {
        id: 'note-4',
        title: 'A Little Random Thought',
        content: 'Just saw a warm cup of coffee and instantly wished you were sitting right across the table from me right now. Thinking of you always!',
        author: 'Ukaasha',
        mood: 'Thinking of You',
        is_pinned: false,
        created_at: new Date('2025-02-14T11:20:00Z').toISOString()
    }
];

class RelationshipService {
    constructor() {
        this.client = null;
        this.config = this.loadConfig();
        this.authStateListeners = [];
        this.initClient();
        this.ensureLocalSeedData();
    }

    // Load saved Supabase configuration
    loadConfig() {
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed.url && parsed.key) return parsed;
            }
        } catch (e) {
            console.warn('Error reading stored Supabase configuration', e);
        }
        return { url: '', key: '' };
    }

    // Save Supabase credentials
    saveConfig(url, key) {
        const cleanUrl = (url || '').trim();
        const cleanKey = (key || '').trim();
        this.config = { url: cleanUrl, key: cleanKey };
        localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify(this.config));
        this.initClient();
    }

    clearConfig() {
        this.config = { url: '', key: '' };
        localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
        this.client = null;
    }

    isSupabaseConfigured() {
        return !!(this.config.url && this.config.key && this.client);
    }

    initClient() {
        if (window.supabase && this.config.url && this.config.key) {
            try {
                this.client = window.supabase.createClient(this.config.url, this.config.key, {
                    auth: {
                        persistSession: true,
                        autoRefreshToken: true
                    }
                });

                // Listen for Supabase auth events
                this.client.auth.onAuthStateChange((event, session) => {
                    this.notifyAuthListeners(event, session ? session.user : null);
                });
            } catch (err) {
                console.error('Failed to initialize Supabase client:', err);
                this.client = null;
            }
        } else {
            this.client = null;
        }
    }

    ensureLocalSeedData() {
        if (!localStorage.getItem(STORAGE_KEYS.LOCAL_MEMORIES)) {
            localStorage.setItem(STORAGE_KEYS.LOCAL_MEMORIES, JSON.stringify(STARTER_MEMORIES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.LOCAL_NOTES)) {
            localStorage.setItem(STORAGE_KEYS.LOCAL_NOTES, JSON.stringify(STARTER_NOTES));
        }
    }

    // --- AUTHENTICATION ---

    async getCurrentUser() {
        if (this.isSupabaseConfigured()) {
            try {
                const { data, error } = await this.client.auth.getUser();
                if (error || !data.user) return null;
                return {
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                    isDemo: false
                };
            } catch (err) {
                console.error('Supabase user check error', err);
            }
        }
        // Fallback local session
        const localUserRaw = localStorage.getItem(STORAGE_KEYS.LOCAL_USER);
        if (localUserRaw) {
            try {
                return JSON.parse(localUserRaw);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    async signIn(email, password) {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPassword = (password || '').trim();

        if (!cleanEmail) throw new Error('Please enter your email address.');
        if (!cleanPassword) throw new Error('Please enter your password.');

        // Check if matching master authorized credentials
        const isMaster = AUTHORIZED_CREDENTIALS.some(
            c => c.email.toLowerCase() === cleanEmail && c.password === cleanPassword
        );

        if (cleanEmail === 'ukaashahaaniya@gmail.com' && !isMaster) {
            throw new Error('Incorrect password for ukaashahaaniya@gmail.com. Access denied.');
        }

        if (this.isSupabaseConfigured()) {
            try {
                const { data, error } = await this.client.auth.signInWithPassword({
                    email: cleanEmail,
                    password: cleanPassword
                });
                if (!error && data && data.user) {
                    const user = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.full_name || 'Ukaasha & Haaniya',
                        isDemo: false
                    };
                    this.notifyAuthListeners('SIGNED_IN', user);
                    return user;
                }
            } catch (supaErr) {
                console.warn('Supabase login attempt:', supaErr);
            }

            // If master credentials were provided but not yet registered in Supabase, auto-create or authenticate
            if (isMaster) {
                try {
                    await this.client.auth.signUp({
                        email: cleanEmail,
                        password: cleanPassword,
                        options: { data: { full_name: 'Ukaasha & Haaniya' } }
                    });
                } catch (e) {
                    // Ignore if already registered
                }
            }
        }

        // Validate local authorized access
        if (isMaster) {
            const authorizedUser = {
                id: 'auth-ukaasha-haaniya',
                email: 'ukaashahaaniya@gmail.com',
                name: 'Ukaasha & Haaniya',
                isDemo: false
            };
            localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(authorizedUser));
            this.notifyAuthListeners('SIGNED_IN', authorizedUser);
            return authorizedUser;
        }

        // Default or user-registered local login
        const storedUserRaw = localStorage.getItem(STORAGE_KEYS.LOCAL_USER);
        if (storedUserRaw) {
            try {
                const parsed = JSON.parse(storedUserRaw);
                if (parsed.email && parsed.email.toLowerCase() === cleanEmail) {
                    this.notifyAuthListeners('SIGNED_IN', parsed);
                    return parsed;
                }
            } catch (e) {}
        }

        // Generic couple session fallback
        const demoUser = {
            id: 'auth-' + Date.now(),
            email: cleanEmail,
            name: cleanEmail.includes('haaniya') ? 'Haaniya' : 'Ukaasha',
            isDemo: true
        };
        localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(demoUser));
        this.notifyAuthListeners('SIGNED_IN', demoUser);
        return demoUser;
    }

    async signUp(email, password, name) {
        if (this.isSupabaseConfigured()) {
            const { data, error } = await this.client.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: name || 'Beloved' }
                }
            });
            if (error) throw error;
            return data;
        } else {
            // Local Demo Mode Sign Up
            const demoUser = {
                id: 'demo-' + Date.now(),
                email: email,
                name: name || (email.toLowerCase().includes('haaniya') ? 'Haaniya' : 'Ukaasha'),
                isDemo: true
            };
            localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(demoUser));
            this.notifyAuthListeners('SIGNED_IN', demoUser);
            return { user: demoUser };
        }
    }

    async signOut() {
        if (this.isSupabaseConfigured()) {
            try {
                await this.client.auth.signOut();
            } catch (e) {
                console.warn('Supabase signout failed', e);
            }
        }
        localStorage.removeItem(STORAGE_KEYS.LOCAL_USER);
        this.notifyAuthListeners('SIGNED_OUT', null);
    }

    onAuthStateChange(callback) {
        this.authStateListeners.push(callback);
    }

    notifyAuthListeners(event, user) {
        this.authStateListeners.forEach(cb => {
            try {
                cb(event, user);
            } catch (err) {
                console.error('Auth listener error', err);
            }
        });
    }

    // --- MEMORIES (PHOTOS) CRUD ---

    async getMemories() {
        if (this.isSupabaseConfigured()) {
            try {
                const { data, error } = await this.client
                    .from('memories')
                    .select('*')
                    .order('memory_date', { ascending: false });

                if (!error && data && data.length > 0) {
                    return data;
                }
                if (error) console.warn('Supabase fetch memories error, using local fallback:', error.message);
            } catch (err) {
                console.warn('Network issue fetching from Supabase, falling back to local storage', err);
            }
        }

        // Local fallback
        try {
            const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_MEMORIES);
            return raw ? JSON.parse(raw) : STARTER_MEMORIES;
        } catch (e) {
            return STARTER_MEMORIES;
        }
    }

    async addMemory({ title, caption, category, memory_date, image_file, image_url }) {
        let finalImageUrl = image_url;

        // If a file was selected and Supabase is configured with storage
        if (image_file && this.isSupabaseConfigured()) {
            try {
                const fileExt = image_file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                const filePath = `memories/${fileName}`;

                const { error: uploadError } = await this.client.storage
                    .from('relationship-vault')
                    .upload(filePath, image_file);

                if (!uploadError) {
                    const { data: publicUrlData } = this.client.storage
                        .from('relationship-vault')
                        .getPublicUrl(filePath);
                    finalImageUrl = publicUrlData.publicUrl;
                } else {
                    console.warn('Storage upload error, falling back to base64 Data URL', uploadError);
                    finalImageUrl = await this.fileToDataUrl(image_file);
                }
            } catch (storageErr) {
                console.warn('Storage operation failed', storageErr);
                finalImageUrl = await this.fileToDataUrl(image_file);
            }
        } else if (image_file) {
            finalImageUrl = await this.fileToDataUrl(image_file);
        }

        if (!finalImageUrl) {
            finalImageUrl = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=85';
        }

        const currentUser = await this.getCurrentUser();
        const newMemory = {
            id: (crypto.randomUUID ? crypto.randomUUID() : 'mem-' + Date.now()),
            user_id: currentUser ? currentUser.id : null,
            title: title || 'A Beautiful Memory',
            caption: caption || '',
            image_url: finalImageUrl,
            category: category || 'Sweet Moments',
            memory_date: memory_date || new Date().toISOString().split('T')[0],
            created_at: new Date().toISOString()
        };

        if (this.isSupabaseConfigured()) {
            try {
                const { data, error } = await this.client
                    .from('memories')
                    .insert([newMemory])
                    .select();

                if (!error && data && data[0]) {
                    return data[0];
                }
                console.warn('Error inserting into Supabase memories:', error);
            } catch (err) {
                console.warn('Supabase insert failed, saving locally', err);
            }
        }

        // Save locally
        const localList = await this.getMemories();
        const updated = [newMemory, ...localList];
        localStorage.setItem(STORAGE_KEYS.LOCAL_MEMORIES, JSON.stringify(updated));
        return newMemory;
    }

    // Deletion eligibility disabled: memories are permanently preserved
    async deleteMemory(id) {
        console.warn('Deletions are permanently disabled in this sanctuary.');
        return false;
    }

    // --- NOTES (LETTERS) CRUD ---

    async getNotes() {
        if (this.isSupabaseConfigured()) {
            try {
                const { data, error } = await this.client
                    .from('notes')
                    .select('*')
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false });

                if (!error && data && data.length > 0) {
                    return data;
                }
                if (error) console.warn('Supabase fetch notes error:', error.message);
            } catch (err) {
                console.warn('Supabase fetch notes network error', err);
            }
        }

        try {
            const raw = localStorage.getItem(STORAGE_KEYS.LOCAL_NOTES);
            return raw ? JSON.parse(raw) : STARTER_NOTES;
        } catch (e) {
            return STARTER_NOTES;
        }
    }

    async addNote({ title, content, author, mood, is_pinned }) {
        const currentUser = await this.getCurrentUser();
        const newNote = {
            id: (crypto.randomUUID ? crypto.randomUUID() : 'note-' + Date.now()),
            user_id: currentUser ? currentUser.id : null,
            title: title || 'Our Little Secret',
            content: content || '',
            author: author || 'Together',
            mood: mood || 'Forever & Always',
            is_pinned: !!is_pinned,
            created_at: new Date().toISOString()
        };

        if (this.isSupabaseConfigured()) {
            try {
                const { data, error } = await this.client
                    .from('notes')
                    .insert([newNote])
                    .select();

                if (!error && data && data[0]) {
                    return data[0];
                }
                console.warn('Error inserting into Supabase notes:', error);
            } catch (err) {
                console.warn('Supabase notes insert error', err);
            }
        }

        const localList = await this.getNotes();
        const updated = [newNote, ...localList];
        localStorage.setItem(STORAGE_KEYS.LOCAL_NOTES, JSON.stringify(updated));
        return newNote;
    }

    async toggleNotePin(id) {
        const notes = await this.getNotes();
        const target = notes.find(n => n.id === id);
        if (!target) return null;

        const newPinnedState = !target.is_pinned;

        if (this.isSupabaseConfigured()) {
            try {
                await this.client
                    .from('notes')
                    .update({ is_pinned: newPinnedState })
                    .eq('id', id);
            } catch (err) {
                console.warn('Supabase toggle pin error', err);
            }
        }

        target.is_pinned = newPinnedState;
        localStorage.setItem(STORAGE_KEYS.LOCAL_NOTES, JSON.stringify(notes));
        return target;
    }

    // Deletion eligibility disabled: love notes are permanently preserved
    async deleteNote(id) {
        console.warn('Deletions are permanently disabled in this sanctuary.');
        return false;
    }

    // Helper: convert File to base64 DataURL for local preview / storage
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Anniversary date configuration
    getAnniversaryDate() {
        const stored = localStorage.getItem(STORAGE_KEYS.ANNIVERSARY_DATE);
        // Default anniversary: June 1, 2024 (editable by couple)
        return stored || '2024-06-01T00:00:00';
    }

    setAnniversaryDate(dateString) {
        localStorage.setItem(STORAGE_KEYS.ANNIVERSARY_DATE, dateString);
    }
}

// Global service instance
window.relationshipService = new RelationshipService();
