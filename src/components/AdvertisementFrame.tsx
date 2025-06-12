/* src/pages-css/DashboardClient.css */
/* ===== STYLE BRUTALIST CLIENT DASHBOARD AMÉLIORÉ ===== */

/* Reset & base */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  font-family: Arial, sans-serif;
  background-color: #ffffff;
  color: #000000;
  overflow-x: hidden;
}

/* Main wrapper */
.brutalist-main-content {
  padding: 2rem;
}
@media (max-width: 640px) {
  .brutalist-main-content {
    padding: 1rem !important;
  }
}

/* Welcome */
.brutalist-welcome-card {
  border: 4px solid #000;
  background: #fff;
  padding: 1.5rem;
  box-shadow: 8px 8px 0 #000;
  margin-bottom: 1.5rem;
  text-align: center;
}
.brutalist-welcome-greeting {
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}
.brutalist-welcome-name {
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #2563eb;
  margin-bottom: 0.5rem;
  word-break: break-word;
}
@media (max-width: 640px) {
  .brutalist-welcome-name {
    font-size: 1.25rem !important;
  }
}
.brutalist-welcome-description {
  font-size: 1rem;
  font-weight: 700;
  color: #000;
}
@media (max-width: 640px) {
  .brutalist-welcome-description {
    font-size: 0.875rem !important;
  }
}

/* Status cards */
.brutalist-status-card {
  border: 4px solid #000;
  box-shadow: 8px 8px 0 #000;
  margin-bottom: 2rem;
}
.brutalist-status-content {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.brutalist-status-icon {
  width: 2rem;
  height: 2rem;
}
.brutalist-status-text {
  font-size: 1.125rem;
  font-weight: 700;
}
.brutalist-status-loading {
  background-color: #dbeafe;
  color: #2563eb;
}
.brutalist-status-warning {
  background-color: #fef3c7;
  color: #d97706;
}
.brutalist-status-info {
  background-color: #f3f4f6;
  color: #6b7280;
}
@media (max-width: 640px) {
  .brutalist-status-content {
    padding: 1rem;
    gap: 0.5rem;
  }
  .brutalist-status-text {
    font-size: 0.875rem !important;
  }
}

/* Actions grid */
.brutalist-action-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-top: 2rem;
}
@media (min-width: 768px) {
  .brutalist-action-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .brutalist-action-grid {
    gap: 1rem;
  }
}

/* Action cards */
.brutalist-action-card {
  border: 4px solid #000;
  background: #fff;
  box-shadow: 8px 8px 0 #000;
}
.brutalist-action-header {
  border-bottom: 4px solid #000;
  padding: 1.5rem;
}
.brutalist-action-header-products {
  background-color: #dbeafe;
}
.brutalist-action-header-history {
  background-color: #dcfce7;
}
.brutalist-action-title {
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
@media (max-width: 640px) {
  .brutalist-action-title {
    font-size: 1.25rem !important;
  }
}
.brutalist-action-content {
  padding: 1.5rem;
  text-align: center;
}
.brutalist-action-description {
  font-weight: 700;
  margin-bottom: 1rem;
}
@media (max-width: 640px) {
  .brutalist-action-content {
    padding: 1rem !important;
  }
  .brutalist-action-description {
    font-size: 0.875rem !important;
  }
}

/* Buttons */
.brutalist-action-button {
  width: 100%;
  height: 3rem;
  border: 4px solid #000;
  font-weight: 900;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 5px 5px 0 #000;
  transition: all 0.2s ease;
}
.brutalist-action-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}
.brutalist-action-button-products {
  background-color: #3b82f6;
  color: #fff;
}
.brutalist-action-button-history {
  background-color: #10b981;
  color: #fff;
}
@media (max-width: 640px) {
  .brutalist-action-button {
    height: auto !important;
    padding: 0.75rem !important;
    font-size: 0.875rem !important;
  }
}

/* AdvertisementFrame styles */
/* Container */
.ad-container {
  border: 4px solid #000;
  background-color: #fff;
  box-shadow: 8px 8px 0 #000;
  margin-bottom: 2rem;
  position: relative;
  overflow: visible; /* Do not truncate content */
  z-index: 10;       /* Display priority */
}
@media (max-width: 640px) {
  .ad-container {
    margin-bottom: 1rem !important;
  }
}

/* Header */
.ad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 4px solid #000;
  background-color: #000;
  padding: 0.75rem 1rem;
}
.ad-header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 900;
  text-transform: uppercase;
  color: #fff;
}
.ad-header-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #fff;
}
.ad-header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.ad-pagination {
  color: #fff;
  font-weight: 700;
}
.ad-dots {
  display: flex;
  gap: 0.25rem;
}
.ad-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}
.ad-dot-active {
  background-color: #fff;
}
.ad-dot-inactive {
  background-color: #6b7280;
}

/* Slide */
.ad-slide {
  position: relative;
  display: flex;
  align-items: center;
}

/* Calque décoratif */
.ad-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}
.ad-background-star {
  position: absolute;
  color: rgba(255, 255, 255, 0.3);
}

/* Nav boutons */
.ad-nav-button {
  position: absolute;
  z-index: 2;
  height: 2rem;
  width: 2rem;
  border-radius: 50%;
  border: 2px solid #000;
  background-color: #fff;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ad-nav-button:hover {
  transform: scale(1.1);
}
.ad-nav-left {
  left: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}
.ad-nav-right {
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
}

/* Contenu à l’avant */
.ad-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
@media (min-width: 768px) {
  .ad-content {
    flex-direction: row;
    justify-content: space-between;
  }
}
@media (max-width: 640px) {
  .ad-content {
    padding: 1rem !important;
    flex-direction: column !important;
    gap: 0.5rem !important;
  }
}

/* Texte */
.ad-text {
  flex: 1;
}
.ad-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: #000;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  text-transform: uppercase;
}
.ad-badge-icon {
  width: 1rem;
  height: 1rem;
  color: #fff;
}
.ad-title {
  font-size: 1.875rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
}
@media (max-width: 640px) {
  .ad-title {
    font-size: 1.5rem !important;
  }
}
.ad-desc {
  color: #fff;
  font-weight: 700;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}
@media (max-width: 640px) {
  .ad-desc {
    font-size: 1rem !important;
  }
}

/* Média adaptatif */
.ad-media-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
.ad-media {
  max-width: 100%;
  height: auto;
  border: 4px solid #000;
  background: #fff;
  object-fit: contain; /* Adjusted for better video adaptation */
}
@media (min-width: 768px) {
  .ad-media {
    max-height: 300px;
    object-fit: contain;
  }
}

/* CTA button */
.ad-cta {
  border: 4px solid #000;
  background-color: #fff;
  color: #000;
  font-weight: 900;
  text-transform: uppercase;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ad-cta:hover {
  transform: translate(-2px, -2px);
  box-shadow: 5px 5px 0 #000;
}

/* Promo circle */
.ad-promo {
  position: relative;
  flex-shrink: 0;
}
.ad-promo-inner {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  border: 4px solid #000;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(12deg);
  margin: auto;
}
@media (min-width: 768px) {
  .ad-promo-inner {
    width: 8rem;
    height: 8rem;
  }
}
.ad-promo-discount {
  font-size: 1.5rem;
  font-weight: 900;
  color: #000;
  transform: rotate(-12deg);
}
@media (max-width: 640px) {
  .ad-promo-discount {
    font-size: 1.25rem !important;
  }
}
.ad-star-badge {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: #fbbf24;
  border: 2px solid #000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Footer */
.ad-footer {
  background-color: #000;
  color: #fff;
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 700;
}
.ad-footer-dot {
  display: inline-block;
  width: 0.5rem;
  height: 0.5rem;
  background-color: #10b981;
  border-radius: 50%;
  margin-right: 0.25rem;
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 640px) {
  .brutalist-action-content p {
    margin-bottom: 0.5rem; /* Adjusted for mobile */
  }

  .brutalist-action-card {
    margin-top: 0 !important;
    padding-top: 0.5rem; /* Adjusted for mobile */
  }

  .brutalist-action-button {
    margin-top: 0 !important;
  }

  .brutalist-main-content {
    padding-top: 1rem; /* Adjusted for mobile */
  }
}
/* ========== 1) Desktop : plus de zoom ni déplacement au survol ========== */
.ad-nav-button:hover {
  transform: none !important;
}

/* Si tu veux absolument recentrer la flèche au hover (au cas où) : */
.ad-nav-left:hover,
.ad-nav-right:hover {
  transform: translateY(-50%) !important;
}

/* ========== 2) Mobile (<640px) : on masque complètement les flèches ========== */
@media (max-width: 640px) {
  .ad-nav-button {
    display: none !important;
  }
}