'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    api.get('/equipment', { params: { search } }).then((res) => setEquipment(res.data.items));
  }, [search]);

  return (
    <div>
      <input placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />
      <div className="grid grid-cols-3 gap-4">
        {equipment.map((item: any) => (
          <div key={item.id} className="border p-4 rounded">
            <h3>{item.name}</h3>
            <p>${item.rentalPrice}/day</p>
            {['ADMIN', 'STAFF'].includes(user?.role) && <button>Edit</button>}
          </div>
        ))}
      </div>
    </div>
  );
}