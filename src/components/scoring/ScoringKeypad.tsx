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
    <div className="grid grid-cols-4 gap-3 mb-6 bg-gray-950/60 backdrop-blur-md p-4 rounded-3xl border border-gray-800 shadow-xl">
      {/* Runs */}
      {[0, 1, 2, 3, 4, 5, 6].map((run) => (
        <button
          key={`run-${run}`}
          onClick={() => onRun(run)}
          className={`
            py-6 rounded-2xl text-2xl md:text-3xl font-black transition-all active:scale-95 shadow-lg
            ${run === 4 || run === 6 ? 'bg-gradient-to-br from-pitch-green to-emerald-700 text-white shadow-[0_5px_20px_rgba(16,185,129,0.3)]' : 
              run === 0 ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 col-span-2 shadow-black/40' : 
              'bg-gray-800 text-white hover:bg-gray-700 shadow-black/40'}
          `}
        >
          {run === 0 ? 'DOT BALL' : run}
        </button>
      ))}

      <button
        onClick={onWicket}
        className="py-6 rounded-2xl text-3xl font-black bg-gradient-to-br from-cherry-red to-red-800 text-white transition-all active:scale-95 shadow-[0_5px_20px_rgba(225,29,72,0.4)]"
      >
        WICKET
      </button>

      {/* Extras */}
      <div className="col-span-4 grid grid-cols-4 gap-3 mt-2">
        <button onClick={() => onExtras('wide')} className="py-4 rounded-xl text-lg font-black bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-500 border border-yellow-700/50 transition-colors">WD</button>
        <button onClick={() => onExtras('no_ball')} className="py-4 rounded-xl text-lg font-black bg-yellow-900/40 hover:bg-yellow-800/60 text-yellow-500 border border-yellow-700/50 transition-colors">NB</button>
        <button onClick={() => onExtras('bye')} className="py-4 rounded-xl text-lg font-black bg-purple-900/40 hover:bg-purple-800/60 text-purple-400 border border-purple-700/50 transition-colors">BYE</button>
        <button onClick={() => onExtras('leg_bye')} className="py-4 rounded-xl text-lg font-black bg-purple-900/40 hover:bg-purple-800/60 text-purple-400 border border-purple-700/50 transition-colors">LB</button>
      </div>
    </div>
  )
}
