export function PrivacyPage() {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <h1 className="text-4xl font-display font-bold mb-8 tracking-tight">Privacy Policy</h1>
      <div className="prose prose-invert max-w-none text-gray-300 space-y-6 text-lg leading-relaxed">
        <p>This is a baseline privacy overview for Renocred, which is currently in active development.</p>
        
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Information You Provide</h2>
        <p>When you use the Renocred application, you may input financial information such as estimated salary, monthly spend across categories, and your current credit cards. Currently, much of this application state is persisted locally in your browser using local storage.</p>
        
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Authentication and Databases</h2>
        <p>Our platform intends to utilize third-party authentication and database infrastructure (such as Clerk and Supabase) to securely manage user accounts and sync application state across devices. As we transition from local state to cloud persistence, your data will be transmitted and stored securely according to the policies of those providers.</p>
        
        <h2 className="text-2xl font-bold text-white mt-12 mb-4">Analytics and Monitoring</h2>
        <p>To improve our product and fix bugs, we use third-party services:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>PostHog:</strong> Used for product analytics to understand how users interact with the platform.</li>
          <li><strong>Sentry:</strong> Used for error tracking and performance monitoring.</li>
        </ul>
        <p>These services may collect technical information about your device, browser, and interactions with our application.</p>
      </div>
    </div>
  );
}
