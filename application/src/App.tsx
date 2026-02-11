import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { useStore } from './store/useStore';
import { generateData } from './core/engine';
import { Play, Download, Copy, Database } from 'lucide-react';

function App() {
	const { blueprint, updateBlueprintName } = useStore();
	const [count, setCount] = useState(10);
	const [output, setOutput] = useState<any[]>([]);

	const handleGenerate = () => {
		const data = generateData(blueprint, count);
		setOutput(data);
	};

	const copyToClipboard = () => {
		navigator.clipboard.writeText(JSON.stringify(output, null, 2));
	};

	return (
		<div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
			<Sidebar />

			<main className="flex-1 flex flex-col">
				{/* Top Bar */}
				<header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/30">
					<div className="flex items-center gap-4">
						<Database className="w-6 h-6 text-indigo-500" />
						<input 
							className="bg-transparent text-xl font-bold outline-none focus:border-b border-indigo-500/50"
							value={blueprint.name}
							onChange={(e) => updateBlueprintName(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
							<span className="text-xs text-slate-500 font-medium">Count:</span>
							<input 
								type="number"
								className="w-12 bg-transparent outline-none text-sm font-bold"
								value={count}
								onChange={(e) => setCount(parseInt(e.target.value) || 1)}
							/>
						</div>
						
						<button 
							onClick={handleGenerate}
							className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg font-bold transition-all"
						>
							<Play className="w-4 h-4 fill-current" />
							Generate
						</button>
					</div>
				</header>

				{/* Preview Area */}
				<div className="flex-1 p-8 overflow-hidden flex flex-col">
					<div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
						<div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-800/50">
							<span className="text-xs font-mono text-slate-500 uppercase tracking-widest">JSON Output</span>
							<div className="flex gap-2">
								<button onClick={copyToClipboard} className="p-1.5 hover:bg-slate-700 rounded text-slate-400" title="Copy">
									<Copy className="w-4 h-4" />
								</button>
								<button className="p-1.5 hover:bg-slate-700 rounded text-slate-400" title="Download">
									<Download className="w-4 h-4" />
								</button>
							</div>
						</div>
						
						<div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-emerald-400">
							{output.length > 0 ? (
								<pre>{JSON.stringify(output, null, 2)}</pre>
							) : (
								<div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
									<div className="w-16 h-16 border-4 border-dashed border-slate-800 rounded-full flex items-center justify-center">
										<Play className="w-6 h-6" />
									</div>
									<p>Click generate to see your data forge in action</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}

export default App;