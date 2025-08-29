"use client";

import { Users, Phone, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import Image from 'next/image';

// --- A dedicated sub-component for each Head's card ---
const HeadContactCard = ({ head }) => {
    const fullName = `${head.firstName} ${head.lastName}`;
    
    return (
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 flex items-center gap-4 border dark:border-slate-700">
            <div className="relative w-14 h-14 rounded-full flex-shrink-0">
                <Image
                    src={head.photo || '/images/default-avatar.png'}
                    alt={fullName}
                    fill
                    className="rounded-full object-cover"
                    sizes="56px"
                />
            </div>
            <div className="min-w-0">
                <p className="font-bold text-slate-800 dark:text-white truncate" title={fullName}>{fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 truncate">
                    <Briefcase size={12} />
                    {head.department?.name || 'N/A'}
                </p>
                <a 
                    href={`tel:${head.phone}`} 
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 font-semibold group mt-1"
                >
                    <Phone size={14} />
                    <span className="group-hover:underline">
                        {head.phone || 'No phone'}
                    </span>
                </a>
            </div>
        </div>
    );
};


export  function DepartmentHeadsCard({ heads }) {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Users className="text-blue-500" /> Key Contacts
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-[24rem] overflow-y-auto pr-2">
            {(!heads || heads.length === 0) ? (
                <p className="text-sm text-center text-slate-400 py-8">No department heads found.</p>
            ) : (
                heads.map(head => (
                    <HeadContactCard key={head.id} head={head} />
                ))
            )}
        </CardContent>
    </Card>
  );
}