"use client";

import { useState } from "react";
import { Save, Plus, Trash2, Calendar } from "lucide-react";

// Mock data - In a real app, fetch this from your API
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function HoursSettingsPage() {
  // Weekly Schedule State
  const [schedule, setSchedule] = useState(
    DAYS.map((day) => ({
      day,
      isOpen: true,
      openTime: "11:00",
      closeTime: "22:00",
    }))
  );

  // Special Dates State
  const [specialDates, setSpecialDates] = useState([
    { id: 1, date: "2024-12-25", name: "Christmas", isOpen: false, openTime: "", closeTime: "" },
  ]);

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].isOpen = !newSchedule[index].isOpen;
    setSchedule(newSchedule);
  };

  const updateTime = (index: number, field: "openTime" | "closeTime", value: string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const addSpecialDate = () => {
    setSpecialDates([
      ...specialDates,
      { id: Date.now(), date: "", name: "New Event", isOpen: true, openTime: "12:00", closeTime: "23:00" },
    ]);
  };

  const removeSpecialDate = (id: number) => {
    setSpecialDates(specialDates.filter((d) => d.id !== id));
  };

  return (
    <div className="space-y-8">
      
      {/* --- Weekly Schedule Section --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          🕒 Weekly Schedule
        </h2>
        <div className="space-y-4">
          {schedule.map((day, index) => (
            <div key={day.day} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
              
              {/* Day Name & Toggle */}
              <div className="flex items-center gap-4 mb-3 sm:mb-0 w-40">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={day.isOpen}
                    onChange={() => toggleDay(index)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className={`font-medium ${day.isOpen ? "text-gray-900" : "text-gray-400"}`}>
                  {day.day}
                </span>
              </div>

              {/* Time Inputs */}
              {day.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) => updateTime(index, "openTime", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) => updateTime(index, "closeTime", e.target.value)}
                    className="p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              ) : (
                <span className="text-gray-400 italic text-sm px-2">Closed all day</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- Special Dates Section --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            📅 Special Days
            </h2>
            <button onClick={addSpecialDate} className="text-sm flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold">
                <Plus size={16} /> Add Date
            </button>
        </div>

        {specialDates.length === 0 ? (
            <p className="text-gray-400 text-sm">No special hours added.</p>
        ) : (
            <div className="space-y-3">
                {specialDates.map((special) => (
                    <div key={special.id} className="flex flex-wrap items-center gap-3 p-3 border border-blue-100 bg-blue-50/50 rounded-lg">
                        <Calendar size={16} className="text-blue-500" />
                        <input 
                            type="date" 
                            className="p-1.5 border border-gray-300 rounded text-sm bg-white"
                            value={special.date}
                            onChange={(e) => {
                                const newDates = specialDates.map(d => d.id === special.id ? {...d, date: e.target.value} : d);
                                setSpecialDates(newDates);
                            }}
                        />
                        <input 
                            type="text" 
                            placeholder="Event Name (e.g. Holiday)" 
                            className="p-1.5 border border-gray-300 rounded text-sm bg-white flex-1 min-w-[120px]"
                            value={special.name}
                             onChange={(e) => {
                                const newDates = specialDates.map(d => d.id === special.id ? {...d, name: e.target.value} : d);
                                setSpecialDates(newDates);
                            }}
                        />
                        <div className="flex items-center gap-2">
                             <select 
                                className="p-1.5 border border-gray-300 rounded text-sm bg-white"
                                value={special.isOpen ? "open" : "closed"}
                                onChange={(e) => {
                                    const isOpen = e.target.value === "open";
                                    const newDates = specialDates.map(d => d.id === special.id ? {...d, isOpen} : d);
                                    setSpecialDates(newDates);
                                }}
                             >
                                 <option value="open">Open</option>
                                 <option value="closed">Closed</option>
                             </select>
                             
                             {special.isOpen && (
                                <>
                                    <input type="time" className="p-1.5 border border-gray-300 rounded text-sm bg-white w-24" defaultValue={special.openTime} />
                                    <span>-</span>
                                    <input type="time" className="p-1.5 border border-gray-300 rounded text-sm bg-white w-24" defaultValue={special.closeTime} />
                                </>
                             )}
                        </div>
                        <button onClick={() => removeSpecialDate(special.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors ml-auto">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="flex justify-end">
        <button className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all">
          <Save size={18} /> Save All Changes
        </button>
      </div>
    </div>
  );
}