// ─── Shared types for the Inventory module ────────────────────────────

export interface ReservationItem {
  id?: string;
  quantity?: number;
  unitPrice?: number | string;
  equipment?: {
    id?: string;
    name?: string;
    description?: string;
    rentalPrice?: number;
    images?: string[];
    category?: { name?: string };
  };
  returnedQuantity?: number;
  damagedQuantity?: number;
}

export interface Reservation {
  id: string;
  orderNumber?: string;
  fullName?: string;
  user?: { id?: string; name?: string; email?: string; uploadedDocuments?: any };
  equipment?: { name?: string; images?: string[] };
  equipmentName?: string;
  items?: ReservationItem[];
  payment?: { status?: string; amount?: number; id?: string };
  status: string;
  totalPrice?: number | string;
  totalAmount?: number | string;
  paymentMethod?: string;
  createdAt?: string;
  startDate?: string;
  endDate?: string;
  from?: string;
  to?: string;
}

export interface Equipment {
  id: string;
  name: string;
  images: string[];
  stockQuantity: number;
  available: boolean;
  category?: { name: string };
}

export interface DamageRecord {
  id: string;
  equipmentId: string;
  description: string;
  quantity: number;
  status: 'DAMAGED' | 'UNDER_MAINTENANCE' | 'REPAIRED';
  createdAt: string;
  equipment: { id: string; name: string; images: string[] };
  recordedBy: { id: string; name: string };
  reservationItem?: { id: string; reservationId: string } | null;
}

export interface MaintenanceRecord {
  id: string;
  equipmentId: string;
  description: string;
  quantity: number;
  status: 'UNDER_MAINTENANCE' | 'COMPLETED';
  createdAt: string;
  equipment: { id: string; name: string; images: string[] };
  recordedBy: { id: string; name: string };
}

export type ActiveTab = 'reservations' | 'stock' | 'damages' | 'maintenance';
export type ActionType = 'damage' | 'maintenance' | 'stock';
