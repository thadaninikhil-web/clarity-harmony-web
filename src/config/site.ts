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

  /**
   * Web3Forms access key for contact/booking form submissions.
   * Get a free key at https://web3forms.com — paste it here.
   * Until configured, forms fall back to mailto.
   */
  web3formsKey: "29cc8b83-9f23-4b80-b8b5-3b96628a6377",
} as const;
