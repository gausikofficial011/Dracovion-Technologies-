/**
 * Returns a list of missing personal details required before a project can be allocated
 * or unlocked for direct employee payment settlement.
 */
export function getMissingPersonalDetails(client: any, order?: any): string[] {
  const missing: string[] = [];
  const fullName = String(client?.fullName || order?.clientPersonalDetails?.fullName || '').trim();
  const phone = String(client?.phone || order?.clientPersonalDetails?.phone || '').trim();
  const location = String(
    client?.city ||
      client?.state ||
      client?.workAddress ||
      order?.clientPersonalDetails?.city ||
      order?.clientPersonalDetails?.state ||
      order?.clientPersonalDetails?.address ||
      ''
  ).trim();

  if (fullName.length < 2) missing.push('Full Name');
  if (phone.replace(/[^0-9]/g, '').length < 7) missing.push('Valid Phone Number');
  if (location.length < 2) missing.push('City / Location');

  return missing;
}
