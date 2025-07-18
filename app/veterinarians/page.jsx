
// app/veterinarians/page.js
"use client";

import { useState } from "react";
import { Search, Filter, Phone, Mail, MapPin } from "lucide-react";

export default function Veterinarians() {
  const [searchTerm, setSearchTerm] = useState("");

  const veterinarians = [
    {
      id: "VET-001",
      name: "Dr. Emily Carter",
      specialization: "Avian Health Specialist",
      location: "Green Valley, CA",
      contact: {
        phone: "+1-202-555-0174",
        email: "emily.carter@vetclinic.com",
      },
      verified: true,
    },
    {
      id: "VET-002",
      name: "Dr. Benjamin Lee",
      specialization: "Poultry Nutritionist",
      location: "Maple Creek, ON",
      contact: {
        phone: "+1-202-555-0182",
        email: "ben.lee@vetcare.com",
      },
      verified: true,
    },
    {
      id: "VET-003",
      name: "Dr. Olivia Rodriguez",
      specialization: "Epidemiology & Disease Control",
      location: "Sunnyvale, TX",
      contact: {
        phone: "+1-202-555-0191",
        email: "olivia.r@poultryhealth.org",
      },
      verified: false,
    },
  ];

  const filteredVets = veterinarians.filter(
    (vet) =>
      vet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vet.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Veterinary Officers</h1>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search veterinarians..."
            className="input w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            className="absolute left-3 top-2.5 text-[color:var(--muted-foreground)]"
            size={18}
          />
        </div>
        <button className="input flex items-center gap-2 bg-[color:var(--card)]">
          <Filter size={18} />
          <span>Filter by Specialization</span>
        </button>
      </div>

      {/* Veterinarians List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVets.map((vet) => (
          <div key={vet.id} className="card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[color:var(--accent)] flex items-center justify-center">
                <span className="text-2xl font-bold text-[color:var(--primary)]">
                  {vet.name.charAt(0)}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold">{vet.name}</h2>
                <p className="text-sm text-[color:var(--muted-foreground)]">
                  {vet.specialization}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-[color:var(--muted-foreground)]" />
                <span>{vet.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[color:var(--muted-foreground)]" />
                <span>{vet.contact.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[color:var(--muted-foreground)]" />
                <span>{vet.contact.email}</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span
                className={`px-3 py-1 text-xs rounded-full ${vet.verified
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {vet.verified ? "Verified" : "Pending Verification"}
              </span>
              <button className="btn-primary">Contact</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
