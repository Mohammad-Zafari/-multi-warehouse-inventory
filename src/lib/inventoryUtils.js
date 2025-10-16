export function evaluateInventoryStatus(currentQty, reorderPoint) {
  let status = "adequate";
  let reorderQty = 0;

  if (currentQty <= 0) {
    status = "critical";
    reorderQty = Math.max(reorderPoint * 2 - currentQty, reorderPoint);
  } else if (currentQty <= reorderPoint) {
    status = "low";
    reorderQty = Math.max(reorderPoint * 2 - currentQty, reorderPoint);
  } else if (currentQty >= reorderPoint * 3) {
    status = "overstocked";
  }

  return { status, reorderQty };
}
