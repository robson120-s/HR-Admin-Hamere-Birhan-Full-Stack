"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Bell, ArrowRight, Hourglass, CalendarOff, AlertCircle } from "lucide-react";

const RequestItem = ({ count, label, href, icon }) => (
    <Link href={href} className="block group">
        <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
            <div className="flex items-center gap-3">
                <div className="text-slate-500">{icon}</div>
                <span className="font-medium text-slate-700 dark:text-slate-200">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`font-bold text-lg ${count > 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                    {count}
                </span>
                <ArrowRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </Link>
);

export default function PendingRequestsCard({ data }) {
  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="text-red-500 animate-pulse" />
          Pending Requests
        </CardTitle>
        <CardDescription>Items that require your immediate attention.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <RequestItem 
          count={data.pendingLeaves || 0}
          label="Leave Requests"
          href="/leave_request"
          icon={<CalendarOff size={20} />}
        />
        <RequestItem 
          count={data.pendingOvertimes || 0}
          label="Overtime Approvals"
          href="/overtime-approval"
          icon={<Hourglass size={20} />}
        />
        <RequestItem 
          count={data.pendingComplaints || 0}
          label="Complain_received"
          href="/complain_received"
          icon={<AlertCircle size={20} />}
        />
      </CardContent>
    </Card>
  );
}