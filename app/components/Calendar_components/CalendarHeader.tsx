
type CurrentYM = {
  year: number;
  month: number;
}

type CalendarHeaderProps = {
  currentYM: CurrentYM;
  setCurrentYM: React.Dispatch<React.SetStateAction<CurrentYM>>;
}

export default function CalendarHeader({currentYM, setCurrentYM}:CalendarHeaderProps) {
  return (
    <div className="flex justify-between">
      <button  
        className="bg-gray-200 hover:bg-gray-300 mx-2 px-4"
        onClick={() => {
          if (currentYM.month <= 0) {
            setCurrentYM({year:currentYM.year-1, month:11});
          } else {
            setCurrentYM({year:currentYM.year, month:currentYM.month-1});
          }
        }}
      >&lt;</button>
      <div>{currentYM.year}年{currentYM.month+1}月</div>
      <button 
        className="bg-gray-200 hover:bg-gray-300 mx-2 px-4"
        onClick={() => {
          if (currentYM.month >= 11) {
            setCurrentYM({year:currentYM.year+1, month:0});
          } else {
            setCurrentYM({year:currentYM.year, month:currentYM.month+1});
          }
        }}
      >&gt;</button>
    </div>
  );
}
