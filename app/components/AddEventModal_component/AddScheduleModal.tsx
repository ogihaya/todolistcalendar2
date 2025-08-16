export default function AddScheduleModal() {
    return (
        <>
            <div>
                <label>予定名</label>
                <input type="text" />
            </div>

            <div>
                <label>開始時刻</label>
                <input type="datetime-local" />
            </div>

            <div>
                <label>終了時刻</label>
                <input type="datetime-local" />
            </div>

            <div>
                <label>繰り返し</label>
                <select>
                    <option value="none">なし</option>
                    <option value="daily">毎日</option>
                    <option value="weekly">毎週</option>
                    <option value="monthly">毎月</option>
                    <option value="yearly">毎年</option>
                </select>
            </div>

            <div>
                <label>場所</label>
                <input type="text" />
            </div>

            <div>
                <label>メモ</label>
                <input type="text" />
            </div>

            <button>
                予定を追加
            </button>
        </>
    );
}