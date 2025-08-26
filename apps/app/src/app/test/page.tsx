export default function TestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Test Page</h1>
        <p>This page works without authentication!</p>
        <button 
          onClick={async () => {
            const response = await fetch('/api/ascii/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt: 'matrix rain' })
            });
            const data = await response.json();
            console.log('Response:', data);
            alert(JSON.stringify(data, null, 2));
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test ASCII Generation API
        </button>
      </div>
    </div>
  );
}