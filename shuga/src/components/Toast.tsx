const MESSAGES: Record<string, string> = {
  sugar: "Reading saved. Nicely done.",
  meal: "Meal noted. Thank you.",
  feel: "Check-in saved. Be kind to yourself.",
};

export function Toast({ kind }: { kind?: string }) {
  const msg = kind && MESSAGES[kind];
  if (!msg) return null;
  return <div className="toast" role="status">{msg}</div>;
}
