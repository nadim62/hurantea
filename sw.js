// HURANTEA push notifications (owner and staff only). Shows the message and opens the right page when tapped.
self.addEventListener("push", (e) => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { title: "HURANTEA", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "HURANTEA", { body: d.body || "", data: { url: d.url || "staff.html" }, tag: "hurantea-human", renotify: true }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "staff.html", self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((ws) => { for (const w of ws) if (w.url === url && "focus" in w) return w.focus(); return clients.openWindow(url); }));
});
