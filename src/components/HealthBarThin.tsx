interface Props {
  percent: number; // 0–100
}

export default function HealthBarThin({ percent }: Props) {
  return (
    <div className="w-64 h-4 bg-gray-800 border-2 border-white rounded mt-2">
      <div
        className="h-full bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-300 rounded"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}