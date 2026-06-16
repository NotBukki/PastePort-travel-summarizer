import { useState } from 'react';

const CONSENT_KEY = 'pp_privacy_consent_v1';

export function useConsent() {
  const [consentGiven, setConsentGiven] = useState(
    () => localStorage.getItem(CONSENT_KEY) === 'true'
  );

  const giveConsent = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setConsentGiven(true);
  };

  const revokeConsent = () => {
    localStorage.removeItem(CONSENT_KEY);
    setConsentGiven(false);
  };

  return { consentGiven, giveConsent, revokeConsent };
}
