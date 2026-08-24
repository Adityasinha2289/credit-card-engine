import { generateTaqdeerResponse } from '../src/features/finix/lib/taqdeerEngine';

async function test() {
  console.log("Testing generateTaqdeerResponse...");
  const res = await generateTaqdeerResponse("what is up", []);
  console.log("Response:", res.content);
}

test().catch(console.error);
