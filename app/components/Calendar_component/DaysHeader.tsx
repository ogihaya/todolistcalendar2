export default function DaysHeader() {
  const daysList = ["日", "月", "火", "水", "木", "金", "土"];
  
  return (
    <div className="grid grid-cols-7">
      {daysList.map((day, index) => (
        <div
          key={day}
          className={`
            py-3 text-center font-semibold text-sm border border-slate-200
            ${index === 0
              ? "text-red-600 bg-red-50"   // 日曜日は赤
              : index === 6
              ? "text-blue-600 bg-blue-50"  // 土曜日は青
              : "text-slate-700 bg-slate-50"   // 平日はグレー
            }
          `}
        >
          {day}
        </div>
      ))}
    </div>
  );
}
  
  
  