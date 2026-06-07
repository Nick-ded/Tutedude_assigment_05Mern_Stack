<div align="center">

<img src="https://media.giphy.com/media/du3J3cXyzhj75IOgvA/giphy.gif" width="100"/>

# ⚡ `useFetch` — React Custom Hook

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=61DAFB&center=true&vCenter=true&width=600&lines=Stop+copy-pasting+fetch+boilerplate.;Hook+it+once%2C+use+it+everywhere.;200+photos.+One+hook.+Zero+drama." alt="Typing SVG" />

<br/>

<img src="https://media.giphy.com/media/f3iwJFOVOwuy7K6FFw/giphy.gif" width="600" style="border-radius:12px"/>

<br/><br/>

[![Live Demo](https://img.shields.io/badge/🚀_LIVE_DEMO-coruseassignment05.netlify.app-00C7B7?style=for-the-badge&logo=netlify&logoColor=white)](https://coruseassignment05.netlify.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Nick--ded-181717?style=for-the-badge&logo=github)](https://github.com/Nick-ded/Tutedude_assigment_05Mern_Stack)

<br/>

</div>

---

<div align="center">
<img src="https://media.giphy.com/media/SWoSkN6DxTszqIKEqv/giphy.gif" width="480"/>
</div>

---

## 🤔 The Problem This Solves

Every React dev has written this **exact same block** at least 50 times:

```jsx
// 😩 The same boring boilerplate in EVERY component
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  fetch('/api/something')
    .then(r => r.json())
    .then(d => { setData(d); setLoading(false) })
    .catch(e => { setError(e.message); setLoading(false) })
}, [])
```

**`useFetch` kills this pattern dead.** Write it once, use it everywhere, never think about it again.

```jsx
// 😎 With useFetch
const { data, loading, error } = useFetch('/api/something')
```

---

## 🔬 The Hook — Full Technical Breakdown

<div align="center">
<img src="https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" width="400"/>
</div>

```js
import { useState, useEffect, useCallback } from 'react'

function useFetch(url) {
  const [data, setData]       = useState(null)   // ← null = no data yet
  const [loading, setLoading] = useState(false)  // ← false = not fetching yet
  const [error, setError]     = useState(null)   // ← null = no error yet

  const fetchData = useCallback(async () => {
    if (!url) return                  // guard: skip if no URL passed

    setLoading(true)                  // 1. signal UI: request starting
    setError(null)                    // 2. clear any previous error
    setData(null)                     // 3. clear stale data (no ghost renders)

    try {
      const response = await fetch(url)

      if (!response.ok) {             // fetch() doesn't throw on 4xx/5xx!
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const json = await response.json()
      setData(json)                   // 4. success — store parsed response

    } catch (err) {
      if (err.name === 'AbortError') return  // ignore intentional cancellations
      setError(err.message || 'Something went wrong.')

    } finally {
      setLoading(false)              // 5. always reset loading, success or fail
    }
  }, [url])  // ← memoized — new function ref ONLY when url changes

  useEffect(() => {
    fetchData()
  }, [fetchData])  // ← stable ref means no infinite loop

  return { data, loading, error, refetch: fetchData }
}
```

---

### 🧠 Why Three Hooks, Not One

<div align="center">

| Hook | What It Does Here | What Breaks Without It |
|------|-------------------|------------------------|
| `useState` | Holds `data`, `loading`, `error` | State changes won't re-render the component |
| `useCallback` | Memoizes `fetchData` so its reference stays stable | Every render creates a new function → `useEffect` fires every render → **infinite loop** |
| `useEffect` | Runs the fetch on mount and URL change | The fetch never runs automatically |

</div>

---

### 💣 The Infinite Loop Bug (And How We Avoid It)

This is the trap that catches most beginners. Here's what happens **without** `useCallback`:

```
Component renders
  → fetchData is defined as a NEW function (new reference in memory)
    → useEffect sees its dependency changed
      → useEffect runs fetchData()
        → setState() is called
          → Component re-renders
            → fetchData is defined as a NEW function again
              → useEffect sees its dependency changed
                → ♾️ INFINITE LOOP
```

`useCallback` fixes this by **memoizing the function** — the reference only changes when `url` changes:

```js
// Without useCallback — new ref every render 🔴
const fetchData = async () => { ... }

// With useCallback — same ref unless url changes ✅
const fetchData = useCallback(async () => { ... }, [url])
```

```
url = "https://api.example.com/photos"
  → fetchData ref: 0x4a2f  (created once)
  → useEffect fires once ✅

url = "https://api.example.com/photos"  (same)
  → fetchData ref: 0x4a2f  (same ref — memoized)
  → useEffect does NOT fire again ✅

url = "https://api.example.com/users"  (changed!)
  → fetchData ref: 0x7c91  (new ref — url dependency changed)
  → useEffect fires again ✅
```

---

### ⚠️ The `fetch()` Footgun You Didn't Know About

Most developers assume `fetch()` throws on bad status codes. **It doesn't.**

```js
// fetch() ONLY rejects on network failure (no internet, DNS error, etc.)
// A 404, 500, 403 — it still RESOLVES successfully 🤯

const response = await fetch('https://api.example.com/doesnotexist')
// response.ok = false, response.status = 404
// But NO error thrown! You have to check manually:

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`)
}
```

The hook handles this explicitly. Without this check, your `error` state would **never trigger** on broken API calls.

---

### 🔄 Full State Machine

```
                    ┌──────────────────────────────────────┐
                    │           useFetch(url)              │
                    └──────────────┬───────────────────────┘
                                   │
                    ┌──────────────▼───────────────────────┐
                    │         IDLE (initial state)         │
                    │  data: null  loading: false          │
                    │  error: null                         │
                    └──────────────┬───────────────────────┘
                                   │ mount / url changes
                                   ▼
                    ┌──────────────────────────────────────┐
                    │              LOADING                 │
                    │  data: null  loading: true           │
                    │  error: null                         │
                    └──────┬───────────────────┬───────────┘
                           │                   │
                     ✅ resolve           ❌ reject / !ok
                           │                   │
            ┌──────────────▼──┐     ┌──────────▼──────────┐
            │    SUCCESS      │     │        ERROR         │
            │  data: [...]    │     │  error: "msg"        │
            │  loading: false │     │  loading: false      │
            │  error: null    │     │  data: null          │
            └──────┬──────────┘     └──────────────────────┘
                   │
             refetch() called
                   │
                   └──► back to LOADING
```

---

### � Hook API Reference

```ts
const {
  data,     // T | null          — parsed JSON response (typed as any in JS)
  loading,  // boolean           — true while request is in-flight
  error,    // string | null     — error message or null
  refetch   // () => void        — manually re-trigger the fetch
} = useFetch(url: string)
```

**Usage patterns:**

```jsx
// 1. Basic — render on success
const { data, loading, error } = useFetch('https://api.example.com/users')

// 2. Dynamic URL — hook auto-refetches when id changes
const { data } = useFetch(`https://api.example.com/users/${id}`)

// 3. Conditional — pass null/empty to skip fetching
const { data } = useFetch(isLoggedIn ? '/api/profile' : null)

// 4. Manual refresh button
const { data, refetch } = useFetch('/api/feed')
return <button onClick={refetch}>↻ Refresh</button>

// 5. Full error handling
const { data, loading, error, refetch } = useFetch('/api/data')
if (loading) return <Spinner />
if (error)   return <ErrorBanner message={error} onRetry={refetch} />
return <DataView data={data} />
```

---

## 🎨 The UI

<div align="center">
<img src="https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif" width="500"/>
</div>

### What's Rendered

200 photos from [JSONPlaceholder](https://jsonplaceholder.typicode.com/photos) in a **4-column dark grid** — each cell is a bordered card with a vivid color block + photo title.

### The Perfect Square Trick (No JS Required)

Keeping a `div` square in a fluid grid is trickier than it sounds. The solution is the **intrinsic ratio technique**:

```css
.card__img {
  position: relative;
  width: 100%;
  padding-top: 100%;   /* height = 100% of width → perfect square */
}

.card__img-inner {
  position: absolute;
  inset: 8px;          /* 8px gap on all sides inside the card */
}
```

**Why this works:** `padding-top` as a percentage is always calculated relative to the element's **width**, not its height. So `padding-top: 100%` always equals the current width — creating a square regardless of the container size. Zero JavaScript, zero ResizeObserver.

### Color Cycling

```js
const COLORS = [
  '#3b82f6', '#7c3aed', '#22c55e', '#ec4899',
  // ... 20 vivid colors
]

// Deterministic — same photo always gets same color
function getColor(id) {
  return COLORS[(id - 1) % COLORS.length]
}
```

The `% COLORS.length` modulo ensures the 20 colors cycle infinitely across any number of photos.

---

## � Project Structure

```
📦 usefetch-custom-hook
│
├── 📁 src
│   ├── 📁 hooks
│   │   └── 🪝 useFetch.js        ← The star. useState + useEffect + useCallback
│   │
│   ├── 📁 components
│   │   ├── 🃏 ProductCard.jsx    ← Reusable card (kept for extensibility)
│   │   ├── 🎨 ProductCard.css
│   │   ├── ⏳ Spinner.jsx        ← CSS-only animated loading spinner
│   │   └── 💅 Spinner.css
│   │
│   ├── 🏠 App.jsx                ← Consumes useFetch, renders grid
│   ├── 🎨 App.css                ← Dark theme, grid layout, intrinsic ratio
│   └── 🚪 main.jsx               ← React 19 createRoot entry point
│
├── 📄 index.html
├── ⚙️  vite.config.js
└── 📦 package.json
```

---

## 🚀 Run It Locally

```bash
# Clone
git clone https://github.com/Nick-ded/Tutedude_assigment_05Mern_Stack.git
cd Tutedude_assigment_05Mern_Stack

# Install
npm install

# Dev server → http://localhost:5173
npm run dev

# Production build → /dist
npm run build
```

---

## 🌐 Deployment

**Live at → [https://coruseassignment05.netlify.app/](https://coruseassignment05.netlify.app/)**

| Setting | Value |
|---|---|
| Platform | Netlify |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Node version | 18+ |

[![Live on Netlify](https://www.netlify.com/img/deploy/button.svg)](https://coruseassignment05.netlify.app/)

---

## 💡 Design Decisions

**Why reset `data` to `null` on each fetch?**
Stale data showing while a new request is in-flight is a classic React bug. It makes users think old data is current. Resetting to `null` forces the loading state to take over — clean visual transition, no ghost data.

**Why expose `refetch`?**
Without it, the only way to re-trigger a fetch is to change the URL. `refetch` lets consumers add pull-to-refresh, retry-on-error buttons, or polling — all without touching the URL.

**Why `err.name === 'AbortError'` check?**
If an `AbortController` is added later (e.g., to cancel in-flight requests on unmount), aborted fetches reject with an `AbortError`. Without this guard, cancelling a request would set an error message — which is wrong behavior. The check future-proofs the hook.

**Why `finally` instead of setting `loading: false` in both try and catch?**
`finally` runs whether the fetch succeeded or failed. It's cleaner, avoids duplication, and guarantees `loading` is always reset even if an unexpected synchronous error occurs inside the try block.

---

## 📚 Tech Stack

| | Technology | Version |
|---|---|---|
| ⚛️ | React | 19 |
| ⚡ | Vite | 8 |
| 🌐 | JSONPlaceholder API | — |
| 🎨 | Vanilla CSS | — |
| 🚀 | Netlify | — |

---

<div align="center">

<img src="https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif" width="400"/>

### Built for Tutedude MERN Stack — Task 5

**[🚀 https://coruseassignment05.netlify.app/](https://coruseassignment05.netlify.app/)**

*Drop a ⭐ if the hook saved you some boilerplate*

</div>
