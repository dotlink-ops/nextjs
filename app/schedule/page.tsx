"use client";

import { useEffect, useState } from "react";

export default function WeeklySchedule() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadSchedule() {
      const res = await fetch("/api/schedule/weekly");
      const scheduleData = await res.json();
      setData(scheduleData);
    }
    loadSchedule();
  }, []);

  if (!data) return <div>Loading schedule…</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-10">
      <h1 className="text-3xl font-bold">Dynamic Weekly Command Panel</h1>

      {Object.entries(data.schedule).map(([day, tasks]) => (
        <div key={day} className="p-6 border rounded-xl bg-white">
          <h2 className="text-xl font-semibold mb-4">{day}</h2>
          {(tasks as any[]).length === 0 && <p className="text-gray-500">No allocations</p>}
          <ul className="space-y-2">
            {(tasks as any[]).map((task: any, i: number) => (
              <li key={i} className="p-3 bg-gray-50 border rounded-lg">
                <div className="font-semibold">{task.full_name}</div>
                <div className="text-sm text-gray-600">
                  Load: {task.predicted_workload} | Risk: {task.predicted_risk} | Demand: {task.predicted_demand}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
