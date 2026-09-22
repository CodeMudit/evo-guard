import React from "react";

const CONTACTS = [
  {
    role: "Team Lead",
    name: "A. Sharma",
    org: "EcoWatch AI · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43210",
    email: "a.sharma@ecowatch-demo.local",
  },
  {
    role: "Backend Lead",
    name: "R. Deb",
    org: "EcoWatch AI · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43211",
    email: "r.deb@ecowatch-demo.local",
  },
  {
    role: "ML / Risk Engine Lead",
    name: "S. Patel",
    org: "EcoWatch AI · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43212",
    email: "s.patel@ecowatch-demo.local",
  },
  {
    role: "Field Operations Coordinator",
    name: "M. Khongwir",
    org: "EcoWatch AI · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43213",
    email: "m.khongwir@ecowatch-demo.local",
  },
];

export const ContactPage = () => (
  <div className="bg-[var(--gov-page-bg)]">
    <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5">
      <h2 className="text-[14px] font-bold">Contact us</h2>
    </div>

    <div className="max-w-[1600px] mx-auto p-3">
      <div className="bg-white border border-[var(--gov-border)]">
        <div className="bg-[var(--gov-navy)] text-white px-3 py-1.5 font-bold text-[13px]">
          Team Directory
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACTS.map((c) => (
            <div key={c.role} className="border border-[var(--gov-border)] p-3">
              <h3 className="font-bold text-[var(--gov-navy)] text-[13px] mb-0.5">
                {c.role}
              </h3>
              <p className="text-[12px] font-medium text-[var(--gov-text)]">{c.name}</p>
              <p className="text-[12px] text-[var(--gov-text-secondary)]">{c.org}</p>
              <p className="text-[12px] text-[var(--gov-text-secondary)]">{c.address}</p>
              <p className="text-[12px] text-[var(--gov-text)] mt-1">Phone: {c.phone}</p>
              <p className="text-[12px] text-[var(--gov-text)]">Email: {c.email}</p>
            </div>
          ))}
        </div>
        <p className="px-4 pb-3 text-[11px] text-[var(--gov-text-muted)] italic">
          Demo contacts for the SIH26001 prototype. Not real operational numbers.
        </p>
      </div>
    </div>
  </div>
);