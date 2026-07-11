export function TemporaryHomepage() {
  return (
    <div className="min-h-screen bg-[#0f1115] flex flex-col items-center justify-center text-white font-sans">
      <h1 className="text-4xl font-display font-bold mb-4 tracking-tight">Renocred</h1>
      <p className="text-[#9ca3af] mb-8">Public platform coming soon.</p>
      <a 
        href="/app" 
        className="bg-[#5da08c] hover:bg-[#4d8675] text-white font-semibold py-3 px-6 rounded-xl transition-all"
      >
        Open Dashboard
      </a>
    </div>
  );
}
