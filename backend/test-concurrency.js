async function attemptHold(userId) {
  const res = await fetch("http://localhost:4000/seats/1/hold", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const data = await res.json();
  return { userId, status: res.status, data };
}

async function main() {
  const [resultA, resultB] = await Promise.all([
    attemptHold("user_a"),
    attemptHold("user_b"),
  ]);

  console.log("User A:", resultA.status, resultA.data);
  console.log("User B:", resultB.status, resultB.data);
}

main();