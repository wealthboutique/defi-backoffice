import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui' }}>
      <h1>DeFi Backoffice v2</h1>
      <p>React application is ready!</p>
      <p>Replace this component with your defi-backoffice-v2.jsx content.</p>
      <div>
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
