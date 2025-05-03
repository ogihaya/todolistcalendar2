export default function AddTaskModal() {
	return (
		<>
			<div>
				<label>タスク名</label>
				<input type="text" />
			</div>

			<div>
				<label>締め切り日</label>
				<input type="datetime-local" />
			</div>

			<div>
				<label>所要時間（時間）</label>
				<input type="number" />
			</div>

			<div>
				<label>メモ</label>
				<input type="text" />
			</div>

			<button>
				タスクを追加
			</button>
		</>
	);
}
