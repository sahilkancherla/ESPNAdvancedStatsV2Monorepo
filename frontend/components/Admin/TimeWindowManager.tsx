import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

interface TimeWindow {
  id: number;
  start_time: string;
  end_time: string;
  week: number;
  year: number;
}

interface FormData {
  date: string;
  startTime: string;
  endTime: string;
  week: string;
  year: string;
}

export const TimeWindowManager = () => {
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [formData, setFormData] = useState<FormData>({
    date: '',
    startTime: '',
    endTime: '',
    week: '',
    year: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  // Get current timezone
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Fetch time windows for selected year
  // Load time windows when component mounts or year changes
  useEffect(() => {
    const fetchTimeWindows = async (year: string) => {
      try {
        const response = await fetch(`${BACKEND_URL}/admin/getTimeWindows?year=${year}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch time windows: ${response.status}`);
        }

        const result = await response.json();
        setTimeWindows(result.data || []);
      } catch (error) {
        console.error('Error fetching time windows:', error);
        showAlert('Failed to fetch time windows', 'error');
      }
    };

    fetchTimeWindows(selectedYear);
  }, [selectedYear]);

  const saveToDatabase = async (window: FormData) => {
    // Convert local datetime to UTC
    const startDateTime = new Date(`${window.date}T${window.startTime}`);
    const endDateTime = new Date(`${window.date}T${window.endTime}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}/admin/addNewTimeWindow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          week: parseInt(window.week),
          year: parseInt(window.year)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create time window: ${response.status}`);
      }

      const result = await response.json();
      return result.data[0];
    } catch (error) {
      console.error('Error creating time window:', error);
      throw error;
    }
  };

  const updateInDatabase = async (id: number, window: FormData) => {
    const startDateTime = new Date(`${window.date}T${window.startTime}`);
    const endDateTime = new Date(`${window.date}T${window.endTime}`);
    
    try {
      const response = await fetch(`${BACKEND_URL}/admin/updateTimeWindow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          week: parseInt(window.week),
          year: parseInt(window.year)
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update time window: ${response.status}`);
      }

      const result = await response.json();
      return result.data[0];
    } catch (error) {
      console.error('Error updating time window:', error);
      throw error;
    }
  };

  const deleteFromDatabase = async (id: number) => {
    try {
      const response = await fetch(`${BACKEND_URL}/admin/deleteTimeWindow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete time window: ${response.status}`);
      }

      const result = await response.json();
      return result.data[0];
    } catch (error) {
      console.error('Error deleting time window:', error);
      throw error;
    }
  };

  // Convert UTC back to local time for display
  const formatLocalTime = (utcString: string) => {
    const date = new Date(utcString);
    return date.toLocaleString('en-US', {
      timeZone: currentTimezone,
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Check if time window has ended
  const isTimeWindowCompleted = (endTime: string) => {
    const now = new Date();
    const endDate = new Date(endTime);
    return now > endDate;
  };

  // Check if time window is in progress
  const isTimeWindowInProgress = (startTime: string, endTime: string) => {
    const now = new Date();
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    return now >= startDate && now <= endDate;
  };

  // Calculate time until window starts
  const getTimeUntilStart = (startTime: string) => {
    const now = new Date();
    const startDate = new Date(startTime);
    const diffMs = startDate.getTime() - now.getTime();
    
    if (diffMs <= 0) return null;
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const showAlert = (message: string, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 3000);
  };

  const resetForm = () => {
    setFormData({ date: '', startTime: '', endTime: '', week: '', year: '' });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const validateForm = () => {
    if (!formData.date || !formData.startTime || !formData.endTime || !formData.week || !formData.year) {
      showAlert('Please fill in all fields', 'error');
      return false;
    }

    if (formData.startTime >= formData.endTime) {
      showAlert('Start time must be before end time', 'error');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingId) {
        // Update existing window
        const updated = await updateInDatabase(editingId, formData);
        setTimeWindows(prev => prev.map(w => w.id === editingId ? updated : w));
        showAlert('Time window updated successfully!');
      } else {
        // Create new window
        const saved = await saveToDatabase(formData);
        setTimeWindows(prev => [...prev, saved]);
        showAlert('Time window saved successfully!');
      }
      resetForm();
    } catch (error) {
        console.error('Error saving time window:', error);
        showAlert('Failed to save time window', 'error');
    }
  };

  const handleEdit = (window: TimeWindow) => {
    // Convert UTC back to local date/time for editing
    const startDate = new Date(window.start_time);
    const endDate = new Date(window.end_time);
    
    const localDate = startDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    const localStartTime = startDate.toTimeString().slice(0, 5); // HH:MM format
    const localEndTime = endDate.toTimeString().slice(0, 5); // HH:MM format

    setFormData({
      date: localDate,
      startTime: localStartTime,
      endTime: localEndTime,
      week: window.week.toString(),
      year: window.year.toString()
    });
    setEditingId(window.id);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteFromDatabase(id);
      setTimeWindows(prev => prev.filter(w => w.id !== id));
      showAlert('Time window deleted successfully!');
    } catch (error) {
      console.error('Error deleting time window:', error);
      showAlert('Failed to delete time window', 'error');
    }
  };

  const openNewForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  // Generate week options (1-18 for NFL season)
  const weekOptions = Array.from({ length: 18 }, (_, i) => i + 1);
  
  // Generate year options (current year and next few years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear + i);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Time Window Manager</h1>
        <p className="text-sm text-gray-600">Timezone: {currentTimezone}</p>
      </div>

      {alert.show && (
        <Alert className={alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}>
          <AlertDescription className={alert.type === 'error' ? 'text-red-700' : 'text-green-700'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Year Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter by Year</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="yearFilter">Select Year:</Label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {editingId ? 'Edit Time Window' : 'Add New Time Window'}
            </CardTitle>
            {!isFormOpen && (
              <Button onClick={openNewForm} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Time Window
              </Button>
            )}
          </div>
        </CardHeader>

        {isFormOpen && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="week">Week</Label>
                <Select value={formData.week} onValueChange={(value) => setFormData(prev => ({ ...prev, week: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select week" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekOptions.map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        Week {week}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Save'}
              </Button>
              <Button variant="outline" onClick={resetForm} className="flex items-center gap-2">
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {timeWindows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Windows for {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeWindows
                .sort((a, b) => a.week - b.week)
                .map((window) => {
                  const inProgress = isTimeWindowInProgress(window.start_time, window.end_time);
                  const completed = isTimeWindowCompleted(window.end_time);
                  const timeUntilStart = !inProgress && !completed ? getTimeUntilStart(window.start_time) : null;
                  
                  return (
                    <div key={window.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">Week {window.week} - {window.year}</h3>
                          {inProgress && (
                            <Badge variant="default" className="bg-blue-100 text-blue-800">
                              In Progress
                            </Badge>
                          )}
                          {completed && !inProgress && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          )}
                          {timeUntilStart && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              Starts in {timeUntilStart}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatLocalTime(window.start_time)} - {formatLocalTime(window.end_time)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Stored as UTC: {window.start_time} - {window.end_time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(window)}
                          className="flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(window.id)}
                          className="flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {timeWindows.length === 0 && !isFormOpen && (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No time windows for {selectedYear}</h3>
            <p className="text-gray-500 mb-4">Create your first time window to get started</p>
            <Button onClick={openNewForm} className="flex items-center gap-2 mx-auto">
              <Plus className="w-4 h-4" />
              Add Time Window
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimeWindowManager;