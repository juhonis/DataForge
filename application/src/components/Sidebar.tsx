import React from 'react';
import { useStore } from '../store/useStore';
import { COMMON_PROVIDERS } from '../core/providers';
import { Plus, Trash2, Settings2, SlidersHorizontal } from 'lucide-react';

export const Sidebar: React.FC = () => {
	const { blueprint, addField, removeField, updateField, updateFieldOption } = useStore();

	const handleAddField = () => {
		const id = crypto.randomUUID();
		addField({
			id,
			key: 'new_field',
			provider: 'commerce.productName',
			options: {}
		});
	};

	return (
		<aside className="w-90 border-r border-slate-800 bg-slate-900 flex flex-col overflow-hidden shrink-0">
			<div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
				<h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-400">
					<Settings2 className="w-4 h-4 text-indigo-500" />
					Blueprint Schema
				</h2>
				<button 
					onClick={handleAddField}
					className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
				>
					<Plus className="w-4 h-4" />
				</button>
			</div>

			<div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
				{blueprint.fields.map((field) => (
					<div key={field.id} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors group">
						<div className="flex items-center justify-between mb-3">
							<input 
								className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-mono text-sm text-yellow-400 w-full mr-2"
								value={field.key}
								onChange={(e) => updateField(field.id, { key: e.target.value })}
							/>
							<button 
								onClick={() => removeField(field.id)}
								className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
							>
								<Trash2 className="w-4 h-4" />
							</button>
						</div>

						<select 
							className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 ring-indigo-500 transition-all mb-3"
							value={field.provider}
							onChange={(e) => updateField(field.id, { provider: e.target.value })}
						>
							{COMMON_PROVIDERS.map(p => (
								<option key={p.value} value={p.value}>{p.label}</option>
							))}
						</select>

						{/* Dynamic Options Section */}
						{(field.provider === 'commerce.price' || field.provider === 'number.int') && (
							<div className="pt-3 border-t border-slate-700/50 flex gap-4">
								<div className="flex-1">
									<label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Min</label>
									<input 
										type="number"
										className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
										value={field.options?.min ?? 0}
										onChange={(e) => updateFieldOption(field.id, 'min', parseInt(e.target.value))}
									/>
								</div>
								<div className="flex-1">
									<label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Max</label>
									<input 
										type="number"
										className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
										value={field.options?.max ?? 1000}
										onChange={(e) => updateFieldOption(field.id, 'max', parseInt(e.target.value))}
									/>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</aside>
	);
};