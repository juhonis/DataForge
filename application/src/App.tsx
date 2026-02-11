import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { useStore } from './store/useStore';
import { generateData } from './core/engine';
import { Play, Download, Copy, Database, Code2 } from 'lucide-react';

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
		<div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden">
			<Sidebar />

			<main className="flex-1 flex flex-col min-w-0">
				{/* Top Bar */}
				<header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md z-10">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
							<Code2 className="w-5 h-5 text-white" />
						</div>
						<input 
							className="bg-transparent text-lg font-bold outline-none focus:ring-b-2 border-indigo-500/50 w-64"
							value={blueprint.name}
							onChange={(e) => updateBlueprintName(e.target.value)}
						/>
					</div>

					<div className="flex items-center gap-6">
						<div className="flex items-center gap-3 px-4 py-1.5 bg-slate-800/50 border border-slate-700 rounded-full">
							<span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Rows</span>
							<input 
								type="number"
								className="w-10 bg-transparent outline-none text-sm font-bold text-indigo-400"
								value={count}
								onChange={(e) => setCount(parseInt(e.target.value) || 1)}
							/>
						</div>
						
						<button 
							onClick={handleGenerate}
							className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-full font-bold transition-all shadow-xl shadow-indigo-500/10 active:scale-95"
						>
							<Play className="w-3 h-3 fill-current" />
							Generate Data
						</button>
					</div>
				</header>

				{/* Editor/Preview Surface */}
				<div className="flex-1 p-6 bg-slate-950 overflow-hidden">
					<div className="h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
						{/* Output Header */}
						<div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
							<div className="flex items-center gap-2">
								<div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
								<span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live JSON Preview</span>
							</div>
							<div className="flex gap-1">
								<button onClick={copyToClipboard} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
									<Copy className="w-4 h-4" />
								</button>
								<button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
									<Download className="w-4 h-4" />
								</button>
							</div>
						</div>
						
						{/* JSON Content */}
						<div className="flex-1 overflow-auto p-8 font-mono text-sm leading-relaxed custom-scrollbar">
							{output.length > 0 ? (
								<pre className="text-emerald-400/90 whitespace-pre-wrap">{JSON.stringify(output, null, 2)}</pre>
							) : (
								<div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
									<Database className="w-12 h-12 opacity-10" />
									<p className="text-sm font-medium opacity-40 uppercase tracking-widest">Awaiting Generation...</p>
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