export default function ScoringKeypad({
  onRun,
  onExtras,
  onWicket
}: {
  onRun: (runs: number) => void
  onExtras: (type: string) => void
  onWicket: () => void
}) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      {/* Runs */}
      {[0, 1, 2, 3, 4, 5, 6].map((run) => (
        <button
          key={`run-${run}`}
          onClick={() => onRun(run)}
          className={`
            py-6 rounded-xl text-2xl font-bold transition-transform active:scale-95
            ${run === 4 || run === 6 ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200'}
            ${run === 0 ? 'col-span-2' : ''}
          `}
        >
          {run === 0 ? 'DOT' : run}
        </button>
      ))}

      <button
        onClick={onWicket}
        className="py-6 rounded-xl text-2xl font-bold bg-red-600 text-white transition-transform active:scale-95"
      >
        W
      </button>

      {/* Extras */}
      <button onClick={() => onExtras('wide')} className="py-4 rounded-xl text-lg font-bold bg-yellow-600/20 text-yellow-500 border border-yellow-600/30">WD</button>
      <button onClick={() => onExtras('no_ball')} className="py-4 rounded-xl text-lg font-bold bg-yellow-600/20 text-yellow-500 border border-yellow-600/30">NB</button>
      <button onClick={() => onExtras('bye')} className="py-4 rounded-xl text-lg font-bold bg-purple-600/20 text-purple-400 border border-purple-600/30">BYE</button>
      <button onClick={() => onExtras('leg_bye')} className="py-4 rounded-xl text-lg font-bold bg-purple-600/20 text-purple-400 border border-purple-600/30">LB</button>
    </div>
  )
}
