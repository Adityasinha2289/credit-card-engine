import { createServer } from 'vite';

async function test() {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom'
  });
  try {
    const mod = await vite.ssrLoadModule('/src/features/dashboard/components/LoginScreen.tsx');
    console.log("LoginScreen loaded successfully");
  } catch (e) {
    console.error("Error loading LoginScreen:", e);
  }
  vite.close();
}
test();
