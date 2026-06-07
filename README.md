<div align="center">

# ⚡ `useFetch` — React Custom Hook

### *Stop copy-pasting fetch boilerplate. Hook it once, use it everywhere.*

![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Assignment](https://img.shields.io/badge/Tutedude-Task%205-ff6b6b?style=for-the-badge)

<br/>

![coding gif](https://media.giphy.com/media/qgQUggAC3Pfv687qPC/giphy.gif)

> **200 photos. One hook. Zero drama.**

<br/>

[🚀 Live Demo](#) &nbsp;•&nbsp; [📦 Installation](#-getting-started) &nbsp;•&nbsp; [🔬 Hook Deep Dive](#-the-usefetch-hook--deep-dive) &nbsp;•&nbsp; [🗂 Project Structure](#-project-structure)

</div>

---

## 🎯 What Is This?

This project is **Task 5** of the Tutedude MERN Stack Assignment series. The goal: build a reusable `useFetch` custom hook in React that abstracts away all the messy async state management you'd otherwise repeat in every component.

No libraries. No Redux. No Apollo. Just **three React hooks** and a fetch call — packaged into one clean, composable utility.

![fetch gif](https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif)

---

## 🔬 The `useFetch` Hook — Deep Dive

```js
// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from 'react'

function useFetch(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const fetchData = useCallback(async () => {
    if (!url) return

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const json = await response.json()
      setData(json)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || 'Something went wrong while fetching data.')
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export default useFetch
```

### 🧠 Why Each Hook Was Chosen

| Hook | Role | Why Not Without It |
|------|------|--------------------|
| `useState` | Manages `data`, `loading`, `error` | Without it, state changes wouldn't trigger re-renders |
| `useCallback` | Memoizes `fetchData` | Without it, a new function reference is created every render → `useEffect` loops infinitely |
| `useEffect` | Triggers fetch on URL change | Without it, the fetch would never run automatically |

### ⚙️ The `useCallback` Trick — Why It Matters

This is the subtle part most tutorials skip. Here's the problem:

```
render → fetchData (new ref) → useEffect fires → setState → render → fetchData (new ref) → ♾️
```

By wrapping `fetchData` in `useCallback([url])`, the function reference only changes when the URL changes. The `useEffect` dependency is stable → **no infinite loop**.

```js
// ✅ Stable reference — effect only re-runs when url changes
const fetchData = useCallback(async () => { ... }, [url])

useEffect(() => {
  fetchData()
}, [fetchData]) // fetchData ref is stable unless url changes
```

### 📤 Return API

```js
const { data, loading, error, refetch } = useFetch(url)
```

| Return Value | Type | Description |
|---|---|---|
| `data` | `any \| null` | Parsed JSON response from the API |
| `loading` | `boolean` | `true` while the request is in-flight |
| `error` | `string \| null` | Error message on failure, `null` on success |
| `refetch` | `() => void` | Manually re-trigger the fetch |

### 🔄 State Machine

```
         ┌─────────────────────────────────┐
         │          useFetch(url)          │
         └─────────────┬───────────────────┘
                       │ url changes or mount
                       ▼
              ┌────────────────┐
              │  loading: true │
              │  error: null   │
              │  data: null    │
              └───────┬────────┘
                      │
           ┌──────────┴──────────┐
           │                     │
     ✅ Success             ❌ Failure
           │                     │
    ┌──────▼──────┐      ┌───────▼───────┐
    │ data: [...]  │      │ error: "msg"  │
    │ loading:false│      │ loading:false │
    └─────────────┘      └───────────────┘
```

---

## 🗂 Project Structure

```
📦 usefetch-custom-hook
├── 📁 src
│   ├── 📁 hooks
│   │   └── 🪝 useFetch.js          ← The star of the show
│   ├── 📁 components
│   │   ├── 🃏 ProductCard.jsx
│   │   ├── 🎨 ProductCard.css
│   │   ├── ⏳ Spinner.jsx
│   │   └── 💅 Spinner.css
│   ├── 🏠 App.jsx                  ← Consumes useFetch
│   ├── 🎨 App.css
│   └── 🚪 main.jsx
├── 📄 index.html
├── ⚙️  vite.config.js
└── 📦 package.json
```

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/Tutedude_assigment_05Mern_Stack.git

# Navigate into it
cd Tutedude_assigment_05Mern_Stack

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) 🎉

![launch gif](https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif)

---

## 🧩 How To Use The Hook

Drop it into **any component** — it works with any URL:

```jsx
import useFetch from './hooks/useFetch'

// Fetch a list of users
function Users() {
  const { data, loading, error } = useFetch('https://jsonplaceholder.typicode.com/users')

  if (loading) return <p>Loading...</p>
  if (error)   return <p>Error: {error}</p>

  return (
    <ul>
      {data.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )
}
```

```jsx
// Fetch with a dynamic URL — hook auto-refetches when userId changes
function UserProfile({ userId }) {
  const { data: user, loading, error, refetch } = useFetch(
    `https://jsonplaceholder.typicode.com/users/${userId}`
  )

  return (
    <>
      {loading && <Spinner />}
      {user && <h1>{user.name}</h1>}
      <button onClick={refetch}>Refresh</button>
    </>
  )
}
```

---

## 🎨 The UI — Photos Gallery

Fetches **200 photos** from [JSONPlaceholder](https://jsonplaceholder.typicode.com/photos) and renders them in a responsive 4-column dark-themed grid.

### Visual Features
- ⬛ Full-width dark grid (`#0a0a0a` background)
- 🟦 Each card has a `1px` bordered rounded container
- 🎨 20 vivid cycling colors for the photo blocks
- 📐 **Perfect squares** using the CSS `padding-top: 100%` intrinsic ratio trick
- 📝 Single-line truncated titles beneath each photo
- ⏳ Animated CSS spinner during load
- ❌ Graceful error state

### The Square Block Trick

```css
/* Forces a perfect 1:1 ratio regardless of container width */
.card__img {
  position: relative;
  width: 100%;
  padding-top: 100%; /* height = width */
}

.card__img-inner {
  position: absolute;
  inset: 8px; /* padding inside the card */
}
```

This is called the **intrinsic ratio technique** — no JavaScript, no ResizeObserver, just pure CSS geometry.

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 19 | UI library |
| [Vite](https://vitejs.dev) | 8 | Build tool & dev server |
| [JSONPlaceholder](https://jsonplaceholder.typicode.com) | — | Fake REST API |
| Vanilla CSS | — | Styling (no framework) |

---

## 🌐 Deployment

Deployed on **Netlify** via GitHub integration.

```
Build command  : npm run build
Publish dir    : dist
Node version   : 18+
```

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start)

---

## 💡 Design Decisions

**Why `useCallback` and not just put the fetch logic directly in `useEffect`?**
Putting async logic directly in `useEffect` works, but returning a `refetch` function becomes impossible without extracting it. `useCallback` lets us define the function once, memoize it, and expose it as a return value — making the hook composable and testable.

**Why reset `data` to `null` on each fetch?**
Stale data showing while a new fetch is in-flight can confuse users into thinking the old data is current. Resetting to `null` forces the loading state to take over, giving a clean visual transition.

**Why `err.name === 'AbortError'` check?**
If an `AbortController` is ever added, aborted fetches would otherwise pollute the error state. This guard future-proofs the hook.

---

## 📚 What I Learned

- How React's closure model interacts with `useEffect` dependencies
- Why `useCallback` is essential for stable function references in hooks
- The CSS intrinsic ratio technique for responsive squares
- How to design a hook API that's useful across multiple components
- Error boundary patterns for async data fetching

---

<div align="center">

![done gif](https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif)

### Built with 🔥 for Tutedude MERN Stack — Task 5

*If this hook helped you, drop a ⭐ on the repo*

</div>
