# UKAASHA & HAANIYA — Our Private Sanctuary 💕

A luxury minimalist website and digital memory vault designed for **Ukaasha & Haaniya** to preserve relationship milestones, store cherished photo memories, and exchange heartfelt love letters. Built with pure HTML, CSS, and modern JavaScript, featuring deep **Supabase Cloud** integration.

---

## ✨ Key Features

1. **Editorial Luxury Aesthetic**:
   - Palette inspired by warm alabaster (`#FBF9F5`), rose champagne, soft terracotta, and rich espresso.
   - Elegant typography pairing *Cormorant Garamond* (editorial serif) and *Plus Jakarta Sans* (clean modern sans).
   - Subtle ambient particle canvas (floating rose and gold stars).
   - Responsive layouts optimized for smartphones, tablets, and desktops.

2. **Live Relationship Counter**:
   - Real-time countdown clock tracking Days, Hours, Minutes, and Seconds together.
   - Customizable anniversary date directly through the interface.

3. **Our Journey & Milestones**:
   - Curated story section and milestone timeline commemorating significant moments in the relationship.

4. **Visual Memories Vault (Image Storage)**:
   - Filterable photo grid (All, Trips, Sweet Moments, Milestones).
   - Fullscreen Lightbox viewer with high-res photo, date, title, and story.
   - Upload new memories with instant image preview, drag-and-drop support, or direct image URL.
   - Automatic sync with Supabase Storage bucket (`relationship-vault`) or browser local storage fallback.

5. **Love Notes & Whispers (Notes Storage)**:
   - Paper-textured digital love letter board with customized author tagging (`From Ukaasha`, `From Haaniya`, `Both of Us`).
   - Pin important letters/promises to the top of the board.
   - Filter notes by author or pinned status.

6. **Dual-Mode Supabase Cloud & Instant Demo Architecture**:
   - **Demo Mode**: Works straight away out of the box using browser `localStorage` with pre-filled romantic memories and notes.
   - **Supabase Cloud Mode**: Seamless login/registration gate, user session management, cross-device database synchronization, and cloud photo storage.

---

## 🚀 Getting Started

### 1. Run Locally
You can open `index.html` directly in any web browser, or serve it using a lightweight local web server:

```powershell
# Option A: Using npx serve (recommended)
npx serve .

# Option B: Using Python
python -m http.server 3000
```

Visit `http://localhost:3000` in your browser.

### 🔑 Couple Access Credentials
- **Email:** `ukaashahaaniya@gmail.com`
- **Password:** `uh@2026`

Entering these credentials immediately unlocks the private sanctuary and all memories and notes.

---

## ☁️ Connecting Supabase Cloud (Optional for Cross-Device Sync)

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase Dashboard, go to **SQL Editor** -> **New Query**.
3. Copy and run the entire contents of [`supabase-schema.sql`](./supabase-schema.sql). This will:
   - Create the `memories` table.
   - Create the `notes` table.
   - Configure Row Level Security (RLS) policies.
   - Create the `relationship-vault` public storage bucket for photos.
4. Go to **Project Settings** -> **API** in Supabase to copy your:
   - **Project URL**
   - **Public anon key**
5. On the website, click the **Settings Gear (⚙️)** or the **Vault Status Badge** in the top navbar, paste your URL and Key, and click **Save & Connect**!

---

## 📂 File Structure

```
UKAASHA_HAANIYA/
├── index.html            # Main semantic webpage with hero, story, gallery, notes, and modals
├── style.css             # Vanilla CSS design system, typography, glassmorphism, responsive grid
├── app.js                # UI interactivity, live relationship counter, lightbox, particle canvas
├── supabase-config.js    # Supabase SDK client, auth handlers, and dual-mode storage engine
├── supabase-schema.sql   # Supabase tables, RLS security policies, and storage bucket setup
└── README.md             # Documentation and instructions
```
