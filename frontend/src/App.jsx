import { useEffect, useState } from 'react';

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Executive Assistant</h1>
      <p className="mt-4">Stage 0 – Project Setup</p>
      {health && (
        <pre className="mt-4 p-4 bg-gray-100 rounded">
          {JSON.stringify(health, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;