import React, { useState } from 'react';
import { useStore } from './store/useStore';
import { generateData } from './core/engine';

function App() {
	const { blueprint } = useStore();
	const [output, setOutput] = useState<any[]>([]);

	const handleGenerate = () => {
		const data = generateData(blueprint, 5);
		setOutput(data);
	};

	return (
		<div className="min-h-screen bg-slate-900 p-8 text-white">
			{/* Tailwind Verification Box */}
			<div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-2xl shadow-indigo-500/20 ring-1 ring-white/20">
				<h1 className="text-3xl font-black tracking-tight">
					Tailwind Diagnostic: {blueprint.name}
				</h1>
				<p className="mt-2 text-indigo-100 italic">
					If this box is purple/blue with rounded corners, Tailwind is WORKING.
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<section className="bg-slate-800 p-6 rounded-xl border border-slate-700">
					<h2 className="text-xl font-bold mb-4 text-slate-300">Blueprint Schema</h2>
					<div className="space-y-3">
						{blueprint.fields.map(f => (
							<div key={f.id} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg border border-slate-600">
								<span className="font-mono text-yellow-400 font-bold">{f.key}</span>
								<span className="text-xs font-semibold bg-slate-600 px-2 py-1 rounded text-slate-300 uppercase tracking-wider">
									{f.provider}
								</span>
							</div>
						))}
					</div>

					<button 
						onClick={handleGenerate}
						className="mt-6 w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold rounded-lg transition-all active:scale-95"
					>
						Run Generator
					</button>
				</section>

				<section className="bg-black/40 rounded-xl border border-slate-800 p-4">
					<h2 className="text-xl font-bold mb-4 text-slate-500">Output Preview</h2>
					{output.length > 0 ? (
						<pre className="text-xs text-emerald-400 font-mono leading-relaxed overflow-auto max-h-[400px]">
							{JSON.stringify(output, null, 2)}
						</pre>
					) : (
						<div className="h-64 flex items-center justify-center text-slate-600 border-2 border-dashed border-slate-800 rounded-lg">
							Click "Run Generator" to see output
						</div>
					)}
				</section>
			</div>
		</div>
	);
}

export default App;