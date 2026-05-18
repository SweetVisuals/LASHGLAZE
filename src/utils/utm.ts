export const captureUTMs = () => {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');

  if (utmSource || utmMedium || utmCampaign) {
    const utmData = {
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('lashglaze_utm', JSON.stringify(utmData));
  }
};

export const getUTMs = () => {
  const data = localStorage.getItem('lashglaze_utm');
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

export const clearUTMs = () => {
  localStorage.removeItem('lashglaze_utm');
};
