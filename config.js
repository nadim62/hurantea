// HURANTEA settings. Fill these two values from Supabase: Project Settings -> API.
// Leave them empty to run the site in preview mode (sample data, nothing is saved).
window.HURANTEA_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdefgh.supabase.co"
  supabaseAnonKey: "",  // the "anon public" key (safe to publish; the database rules protect your data)
  contactEmail: "",     // e.g. "hello@hurantea.com" — enables "Contact us" and "Report a problem" in the footer
  operatorName: "",
  siteUrl: "https://hurantea.com",          // your public site, e.g. "https://hurantea.com" — used for the expert links sent from the owner area
  // operatorName above: your company's legal name, e.g. "HURANTEA FZ-LLC, Dubai" — shown as "Operated by …"
  vapidPublicKey: "",   // push notifications for you and your staff: the public VAPID key (see SETUP.md)
  feeRate: 0.15,
  goalUSD: 1000000000,
  goalDate: "2027-12-31",
};
