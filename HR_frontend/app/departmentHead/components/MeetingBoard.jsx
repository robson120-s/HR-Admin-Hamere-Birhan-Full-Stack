"use client";

import { Calendar, Clock, User, LoaderCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

const MeetingCard = ({ meeting }) => {
    const creatorName = meeting.creator ? `${meeting.creator.firstName} ${meeting.creator.lastName}` : 'HR Department';
    const meetingDate = new Date(meeting.date);
    const isPast = meetingDate < new Date();

    return (
        <div className={`p-4 border-b last:border-b-0 dark:border-slate-700 ${isPast ? 'opacity-60' : ''}`}>
            <p className="font-bold text-slate-800 dark:text-slate-100">{meeting.title}</p>
            {meeting.description && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{meeting.description}</p>}
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                <div className="flex items-center gap-1.5" title="Date">
                    <Calendar size={14} />
                    <span>{meetingDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Time">
                    <Clock size={14} />
                    <span>{meeting.time}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Posted by">
                    <User size={14} />
                    <span>{creatorName}</span>
                </div>
            </div>
        </div>
    )
}

export function MeetingBoard({ meetings = [], isLoading = false }) {
    // Ensure meetings is always an array
    const safeMeetings = Array.isArray(meetings) ? meetings : [];
    
    // Sort meetings by date (most recent first)
    const sortedMeetings = [...safeMeetings].sort((a, b) => {
        try {
            return new Date(b.date) - new Date(a.date);
        } catch (error) {
            console.error("Error sorting meetings:", error);
            return 0;
        }
    });
    
    return (
        <Card className="bg-white dark:bg-slate-800/50 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Calendar className="text-blue-500" />
                    Upcoming Meetings & Events
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? (
                    <div className="flex justify-center items-center h-48">
                        <LoaderCircle className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : sortedMeetings.length === 0 ? (
                    <p className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No meetings scheduled.
                    </p>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {sortedMeetings.map(meeting => (
                            <MeetingCard key={meeting.id} meeting={meeting} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}