export default function DaysHeader() {

  const daysList = ["日", "月", "火", "水", "木", "金", "土"];
  
    return (
      <div className="grid grid-cols-7">
          {daysList.map((day, index) => (
              // indexが0なら日曜日、6なら土曜日
              <div
                  key={day}
                  // 条件によってクラスを切り替えます
                  className={
                    "border border-gray-300 text-center " +
                    (index === 0
                      ? "text-red-500"   // 日曜日は赤
                      : index === 6
                      ? "text-blue-500"  // 土曜日は青
                      : ""   
                    )            // 他の曜日はデフォルト
                  }
              >
                  {day}
              </div>
          ))}
      </div>
    );
  }
  
  
  