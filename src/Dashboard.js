// Dashboard.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faChair, faUserFriends, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DashboardCard = ({ title, value, icon, color }) => (
  <div className={`card bg-base-100 shadow-xl`}>
    <div className="card-body">
      <h2 className="card-title text-2xl mb-4">{title}</h2>
      <div className="flex items-center justify-between">
        <span className="text-4xl font-bold">{value}</span>
        <FontAwesomeIcon icon={icon} className={`text-5xl ${color}`} />
      </div>
    </div>
  </div>
);

const Dashboard = ({ guests, tables, compatibility }) => {
  const totalGuests = guests.length;
  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const seatedGuests = tables.reduce((sum, table) => sum + table.guests.length, 0);
  
  const compatibleGroups = guests.reduce((groups, guest) => {
    const compatibleGuests = guests.filter(otherGuest => 
      guest.id !== otherGuest.id && 
      compatibility[guest.id]?.[otherGuest.id] === 'good'
    );
    if (compatibleGuests.length > 0) {
      groups.add(JSON.stringify([guest.id, ...compatibleGuests.map(g => g.id)].sort()));
    }
    return groups;
  }, new Set());

  const incompatiblePairs = guests.reduce((count, guest) => {
    return count + guests.filter(otherGuest => 
      guest.id !== otherGuest.id && 
      compatibility[guest.id]?.[otherGuest.id] === 'bad'
    ).length;
  }, 0) / 2; // Divide by 2 to avoid counting pairs twice

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Gesamtzahl Gäste" 
          value={totalGuests} 
          icon={faUsers} 
          color="text-primary"
        />
        <DashboardCard 
          title="Verfügbare Sitzplätze" 
          value={totalSeats} 
          icon={faChair} 
          color="text-secondary"
        />
        <DashboardCard 
          title="Kompatible Gruppen" 
          value={compatibleGroups.size} 
          icon={faUserFriends} 
          color="text-success"
        />
        <DashboardCard 
          title="Inkompatible Paare" 
          value={incompatiblePairs} 
          icon={faExclamationTriangle} 
          color="text-warning"
        />
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sitzplatzverteilung</h2>
        <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
          <div 
            className="bg-primary h-4 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(seatedGuests / totalGuests) * 100}%` }}
          ></div>
        </div>
        <p className="mt-2 text-center">{seatedGuests} von {totalGuests} Gästen platziert ({((seatedGuests / totalGuests) * 100).toFixed(1)}%)</p>
      </div>
    </div>
  );
};

export default Dashboard;