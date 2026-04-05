/**
 * Site-wide configuration constants.
 * Update values here instead of scattering them across components.
 */

export const SITE_CONFIG = {
  name: "Balancing Act",
  tagline: "Financial Planning Built on Discipline, Clarity and Trust",
  contactEmail: "nikhil@balancingact.co.in",
  phone: "+919987522690",
  phoneDisplay: "+91 99875 22690",
  whatsappUrl: "https://wa.me/919987522690",
  linkedinUrl: "https://www.linkedin.com/in/thadaninikhil",
  url: "https://balancingact.co.in",

  web3formsKey: "29cc8b83-9f23-4b80-b8b5-3b96628a6377",

  // ✅ NEW AUTHOR BLOCK
  author: {
    name: "Nikhil Thadani",
    role: "Financial Planner",
    bio: "Nikhil Thadani works with clients to discover their financial goals and build disciplined, goal-oriented investment strategies grounded in long-term thinking.",
    image: "/author.jpg", // optional (add later if needed)
  },
} as const;