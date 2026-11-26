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

/**
 * Returns true only when an order is completed AND its handover payment is verified.
 */
export function isOrderCompletedAndPaid(order: any): boolean {
  if (!order || order.status !== 'completed') return false;
  return (
    order.handoverStatus === 'handover_completed' ||
    order.handoverPaymentProof?.status === 'verified'
  );
}

/**
 * Returns true only when a project is completed AND its settlement payment is verified.
 */
export function isProjectCompletedAndPaid(project: any): boolean {
  if (!project || project.status !== 'completed') return false;
  return (
    project.handoverStatus === 'handover_cleared' ||
    project.handoverPaymentProof?.status === 'verified'
  );
}
