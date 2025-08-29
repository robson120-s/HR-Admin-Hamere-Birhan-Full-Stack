"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CalendarCheck2, User, Info } from "lucide-react";
import { addMeeting, deleteMeeting as apiDeleteMeeting } from "../../../../lib/api";
import toast from "react-hot-toast";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

// Sub-components
const MeetingForm = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState({ 
        title: "", 
        description: "",
        date: new Date().toISOString().slice(0, 10), 
        time: "14:00 - 15:00" 
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg shadow-inner space-y-4">
            <Input name="title" value={formData.title} onChange={handleChange} placeholder="Meeting Title" required />
            <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description (optional)" rows={2} />
            <div className="flex gap-4">
                <Input name="date" value={formData.date} onChange={handleChange} type="date" required />
                <Input name="time" value={formData.time} onChange={handleChange} placeholder="e.g., 14:00 - 15:00" required />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Meeting"}</Button>
            </div>
        </form>
    );
};

const MeetingItem = ({ meeting, isPast, onDelete }) => {
    // Fix for null creator
    const creatorName = meeting.creator ? `${meeting.creator.firstName} ${meeting.creator.lastName}` : 'Unknown';
    
    // Format date for display
    const meetingDate = new Date(meeting.date);
    const formattedDate = meetingDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    return (
        <div className={`p-4 rounded-lg flex items-start gap-4 transition-all duration-300 border ${isPast ? 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60' : 'bg-blue-50 dark:bg-blue-900/40 border-blue-200 dark:border-blue-800'}`}>
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex flex-col items-center justify-center shadow-sm ${isPast ? 'bg-slate-500 text-white' : 'bg-blue-600 text-white'}`}>
                <span className="text-xs font-bold uppercase">{meetingDate.toLocaleString('default', { month: 'short' })}</span>
                <span className="text-xl font-bold">{meetingDate.getDate()}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate" title={meeting.title}>{meeting.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{formattedDate} • {meeting.time}</p>
                {meeting.description && <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic truncate" title={meeting.description}><Info size={12} className="inline mr-1"/>{meeting.description}</p>}
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5"><User size={12}/>By: {creatorName}</p>
            </div>
            <button onClick={() => onDelete(meeting.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                <Trash2 size={16} />
            </button>
        </div>
    );
};

// Main Component
export default function MeetingSchedule({ meetings: initialMeetings = [], onUpdate }) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialMeetings)) {
      const sortedData = [...initialMeetings].sort((a, b) => new Date(a.date) - new Date(b.date));
      setMeetings(sortedData);
    } else {
      setMeetings([]);
    }
  }, [initialMeetings]);

  const handleAddMeeting = async (formData) => {
    await toast.promise(addMeeting(formData), {
        loading: 'Saving meeting...',
        success: () => {
            setShowForm(false);
            onUpdate(); // Tell the parent dashboard to refetch ALL data
            return 'Meeting added successfully!';
        },
        error: (err) => err.response?.data?.error || 'Failed to add meeting.'
    });
  };

  const handleDeleteMeeting = async (id) => {
    if (window.confirm("Are you sure you want to delete this meeting?")) {
        await toast.promise(apiDeleteMeeting(id), {
            loading: 'Deleting meeting...',
            success: () => {
                onUpdate(); // Tell the parent dashboard to refetch ALL data
                return 'Meeting deleted.';
            },
            error: 'Failed to delete meeting.'
        });
    }
  };

  // Fix for time parsing - handle various time formats
  const getMeetingEndTime = (meeting) => {
    if (!meeting.time) return new Date(meeting.date);
    
    // Handle different time formats
    let timePart;
    if (meeting.time.includes('-')) {
      timePart = meeting.time.split('-')[1] || meeting.time.split('-')[0];
    } else if (meeting.time.includes(' to ')) {
      timePart = meeting.time.split(' to ')[1] || meeting.time.split(' to ')[0];
    } else {
      timePart = meeting.time;
    }
    
    // Clean up the time string
    timePart = timePart.trim();
    
    // Handle 24-hour time format
    if (timePart.includes(':')) {
      const [hours, minutes] = timePart.split(':').map(part => parseInt(part) || 0);
      const date = new Date(meeting.date);
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
    
    // Default to end of day if time format is unrecognized
    const date = new Date(meeting.date);
    date.setHours(23, 59, 59, 999);
    return date;
  };

  const now = new Date();
  const upcomingMeetings = meetings.filter(m => getMeetingEndTime(m) >= now);
  const pastMeetings = meetings.filter(m => getMeetingEndTime(m) < now);

  return (
    <Card className="bg-white dark:bg-slate-800/50 shadow-lg h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck2 className="text-blue-500"/> Meeting Schedule
        </CardTitle>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} className="mr-2" /> {showForm ? 'Close' : 'Add'}
        </Button>
      </CardHeader>

      <CardContent>
        {showForm && <MeetingForm onSave={handleAddMeeting} onCancel={() => setShowForm(false)} />}
        
        <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2">
            {meetings.length === 0 && !showForm && (
                <p className="text-center text-sm text-slate-400 py-8">No recent or upcoming meetings.</p>
            )}
            
            {upcomingMeetings.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">Upcoming</h3>
                {upcomingMeetings.map(m => (
                  <MeetingItem key={m.id} meeting={m} isPast={false} onDelete={handleDeleteMeeting} />
                ))}
              </>
            )}
            
            {pastMeetings.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 pt-4 border-t dark:border-slate-700">Recent Past</h3>
                {pastMeetings.map(m => (
                  <MeetingItem key={m.id} meeting={m} isPast={true} onDelete={handleDeleteMeeting} />
                ))}
              </>
            )}
        </div>
      </CardContent>
    </Card>
  );
}