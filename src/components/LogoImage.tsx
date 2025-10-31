"use client";

export default function LogoImage() {
  return (
    <img
      src="/logos/soccerconnect_logo.svg"
      alt="SoccerConnect"
      className="h-8 w-auto"
      onError={(e) =>
        (e.currentTarget.src = "https://placehold.co/120x40?text=SoccerConnect")
      }
    />
  );
}
