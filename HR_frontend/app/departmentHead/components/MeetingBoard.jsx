// app/(departmentHead)/components/MeetingBoard.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { getMeetings } from "../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import { Calendar, Clock, User, LoaderCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/card";

const MeetingCard = ({ meeting }) => {
    const creatorName = meeting.creator ? `${meeting.creator.firstName} ${meeting.creator.lastName}` : 'HR Department';
    return (
        <div className="p-4 border-b last:border-b-0 dark:border-slate-700">
            <p className="font-bold text-slate-800 dark:text-slate-100">{meeting.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{meeting.description}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-3">
                <div className="flex items-center gap-1.5" title="Date">
                    <Calendar size={14} />
                    <span>{new Date(meeting.date).toLocaleDateString()}</span>
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

export function MeetingBoard() {
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMeetings = useCallback(async () => {
        try {
            const data = await getMeetings();
            setMeetings(data);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMeetings();
    }, [fetchMeetings]);

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
                ) : meetings.length === 0 ? (
                    <p className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No upcoming meetings scheduled.
                    </p>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {meetings.map(meeting => (
                            <MeetingCard key={meeting.id} meeting={meeting} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}