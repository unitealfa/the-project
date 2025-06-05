// src/pages-css/login/LogoAnimation.tsx
import React, { useEffect, useRef } from "react";
import "./LogoAnimation.css";

const LogoAnimation: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1) À 4 000 ms, on déclenche le zoom
    const zoomTimer = setTimeout(() => {
      logoRef.current?.classList.add("zoom");
    }, 4000);

    // 2) À 5 500 ms, on cache tout
    const hideTimer = setTimeout(() => {
      logoRef.current?.classList.add("hidden");
    }, 5000);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div className="logo" ref={logoRef}>
      <svg viewBox="0 0 200 200">
        <circle className="circle tl" cx="50" cy="40" r="20" />
        <circle className="circle ml" cx="50" cy="100" r="20" />
        <circle className="circle bl" cx="50" cy="160" r="20" />
        <circle className="circle tr" cx="150" cy="40" r="20" />
        <circle className="circle mr" cx="150" cy="100" r="20" />
        <path
          className="path"
          d="
            M150,40
            L50,40
            L150,100
            L50,100
            L150,40
            L50,160
            L150,100
          "
        />
      </svg>
      <div className="text">
        <span className="letter" style={{ animationDelay: "2.5s" }}>R</span>
        <span className="letter" style={{ animationDelay: "2.55s" }}>o</span>
        <span className="letter" style={{ animationDelay: "2.60s" }}>u</span>
        <span className="letter" style={{ animationDelay: "2.65s" }}>t</span>
        <span className="letter" style={{ animationDelay: "2.70s" }}>i</span>
        <span className="letter" style={{ animationDelay: "2.75s" }}>m</span>
        <span className="letter" style={{ animationDelay: "2.80s" }}>i</span>
        <span className="letter" style={{ animationDelay: "2.85s" }}>z</span>
        <span className="letter" style={{ animationDelay: "2.90s" }}>e</span>
      </div>
    </div>
  );
};

export default LogoAnimation;
