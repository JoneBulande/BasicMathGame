import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Game } from './pages/Game'
import { Home } from './pages/Home'

function App() {
  return (
    <div className="min-h-screen bg-black p-5">
      <header className="w-full border-b-4 border-blue-500 p-3 text-4xl mb-10 text-white">
        <a href="/">Math Games</a>
      </header>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/operator/:operator" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
