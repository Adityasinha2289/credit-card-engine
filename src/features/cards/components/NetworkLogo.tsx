/**
 * Network logo SVGs embedded inline — no external image dependency.
 * Each returns a React SVG element sized to fit the card face.
 */

export const VisaLogo = () => (
  <svg
    viewBox="0 0 60 20"
    aria-label="Visa"
    className="h-6 w-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="0"
      y="17"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="800"
      fontSize="20"
      fill="white"
      letterSpacing="-1"
    >
      VISA
    </text>
  </svg>
);

export const MastercardLogo = () => (
  <svg
    viewBox="0 0 48 30"
    aria-label="Mastercard"
    className="h-8 w-auto"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="15" r="13" fill="#EB001B" opacity="0.9" />
    <circle cx="32" cy="15" r="13" fill="#F79E1B" opacity="0.9" />
    <path
      d="M24 5.5a13 13 0 0 1 0 19 13 13 0 0 1 0-19z"
      fill="#FF5F00"
      opacity="0.9"
    />
  </svg>
);

export const AmexLogo = () => (
  <svg
    viewBox="0 0 80 20"
    aria-label="American Express"
    className="h-6 w-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="0"
      y="16"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="700"
      fontSize="16"
      fill="white"
      letterSpacing="2"
    >
      AMEX
    </text>
  </svg>
);

export const DiscoverLogo = () => (
  <svg
    viewBox="0 0 90 24"
    aria-label="Discover"
    className="h-6 w-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="0"
      y="18"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="600"
      fontSize="16"
      fill="white"
      letterSpacing="1"
    >
      DISCOVER
    </text>
  </svg>
);

export const RupayLogo = () => (
  <svg
    viewBox="0 0 80 20"
    aria-label="RuPay"
    className="h-6 w-auto"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text
      x="0"
      y="16"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="900"
      fontSize="17"
      fill="white"
      fontStyle="italic"
      letterSpacing="0"
    >
      RuPay
    </text>
  </svg>
);
