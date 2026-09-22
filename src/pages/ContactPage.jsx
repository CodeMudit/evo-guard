import React from "react";

const CONTACTS = [
  {
    role: "Team Lead",
    name: "A. Sharma",
    org: "EvoGuard · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43210",
    email: "a.sharma@evoguard-demo.local",
  },
  {
    role: "Backend Lead",
    name: "R. Deb",
    org: "EvoGuard · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43211",
    email: "r.deb@evoguard-demo.local",
  },
  {
    role: "ML / Risk Engine Lead",
    name: "S. Patel",
    org: "EvoGuard · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43212",
    email: "s.patel@evoguard-demo.local",
  },
  {
    role: "Field Operations Coordinator",
    name: "M. Khongwir",
    org: "EvoGuard · SIH26001",
    address: "North Eastern Region Prototype Unit",
    phone: "+91 98765 43213",
    email: "m.khongwir@evoguard-demo.local",
  },
];

export const ContactPage = () => (
  <div className="bg-transparent relative z-10">
    <div className="bg-[var(--gov-primary)] text-white px-4 py-2">
      <h2 className="text-[15px] font-semibold tracking-wide">Support</h2>
    </div>

    <div className="w-full px-3 md:px-4 lg:px-5 py-4">
      <div className="bg-white/95 backdrop-blur-sm border border-[var(--gov-border)] rounded-[var(--panel-radius)] shadow-sm overflow-hidden">
        <div className="bg-[var(--gov-primary)] text-white px-4 py-2 font-semibold text-[13px]">
          Team Directory
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONTACTS.map((c) => (
            <div
              key={c.role}
              className="border border-[var(--gov-border)] rounded-md p-4 bg-slate-50/50"
            >
              <h3 className="font-semibold text-[var(--gov-primary)] text-[14px] mb-1">
                {c.role}
              </h3>
              <p className="text-[13px] font-medium text-[var(--gov-text)]">{c.name}</p>
              <p className="text-[12px] text-[var(--gov-text-secondary)]">{c.org}</p>
              <p className="text-[12px] text-[var(--gov-text-secondary)]">{c.address}</p>
              <p className="text-[13px] text-[var(--gov-text)] mt-2">Phone: {c.phone}</p>
              <p className="text-[13px] text-[var(--gov-text)]">Email: {c.email}</p>
            </div>
          ))}
        </div>
        <p className="px-4 pb-4 text-[12px] text-[var(--gov-text-muted)] italic">
          Demo contacts for the SIH26001 prototype. Not real operational numbers.
        </p>
      </div>
    </div>
  </div>
);