// Минималистичный UX-logger
export function logUXEvent(event: string, extra: Record<string, any> = {}) {
  const history = JSON.parse(localStorage.getItem('ux_event_history') || '[]');
  const entry = {
    event,
    ...extra,
    timestamp: new Date().toISOString(),
  };
  history.push(entry);
  // last 300 событий
  if (history.length > 300) history.shift();
  localStorage.setItem('ux_event_history', JSON.stringify(history));
}

export function getUXEvents(): any[] {
  return JSON.parse(localStorage.getItem('ux_event_history') || '[]');
}
