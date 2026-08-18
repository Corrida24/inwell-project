import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuditHero } from '../audit/AuditHero';
import { AuditWhySection } from '../audit/AuditWhySection';
import { Footer } from '../components/Footer';

/** Personal / consumer landing — reached via the "Для людей" header tab at
 * /personal. Hero + "why" + CTA; the data-entry form and the report each
 * live on their own route (/personal/start, /personal/report). */
export const PersonalLandingPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <AuditHero onStart={() => navigate('/personal/start')} />
      <AuditWhySection />
      <Footer />
    </>
  );
};
