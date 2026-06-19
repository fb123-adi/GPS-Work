export const site = {
  name: "AURUM",
  tagline: "Crafted for Excellence",
  domain: "aurum.com",
  description:
    "Luxury sportswear engineered for performance and designed for prestige. Premium activewear, gym apparel, and limited edition collections.",
  keywords: [
    "Luxury Sportswear",
    "Premium Activewear",
    "Luxury Gym Clothing",
    "Luxury Apparel",
    "Premium Sports Garments",
  ],
  nav: [
    { label: "Men", href: "/men" },
    { label: "Women", href: "/women" },
    { label: "Children", href: "/children" },
    { label: "Collections", href: "/collections" },
    { label: "Lifestyle", href: "/lifestyle" },
  ],
  footer: {
    columns: [
      {
        heading: "Maison",
        links: ["About", "Collections", "Lifestyle", "Careers"],
      },
      {
        heading: "Client Care",
        links: ["Support", "Contact", "Shipping", "Returns"],
      },
      {
        heading: "Legal",
        links: ["Privacy", "Terms", "Cookie Policy", "Accessibility"],
      },
    ],
    social: ["Instagram", "TikTok", "YouTube", "Pinterest"],
  },
} as const;
