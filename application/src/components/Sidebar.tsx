import React from 'react';
import { useStore } from '../store/useStore';
import { COMMON_PROVIDERS } from '../core/providers';
import { Plus, Trash2, Settings2 } from 'lucide-react';

export const Sidebar: React.FC = () => {
	const { blueprint, addField, removeField, updateField } = useStore();

	const handleAddField = () => {
		const id = crypto.randomUUID();
		addField({
			id,
			key: 'new_field',
			provider: 'commerce.productName'
		});
	};

	return (
		<aside className="w-80 border-r border-slate-800 bg-slate-900/50 p-6 flex flex-col gap-6 overflow-y-auto">
			<div className="flex items-center justify-between">
				<h2 className="text-lg font-bold flex items-center gap-2">
					<Settings2 className="w-5 h-5 text-indigo-400" />
					Schema
				</h2>
				<button 
					onClick={handleAddField}
					className="p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors"
				>
					<Plus className="w-4 h-4" />
				</button>
			</div>

			<div className="space-y-4">
				{blueprint.fields.map((field) => (
					<div key={field.id} className="p-4 rounded-lg bg-slate-800 border border-slate-700 space-y-3 group">
						<div className="flex items-center justify-between">
							<input 
								className="bg-transparent border-b border-transparent focus:border-indigo-500 outline-none font-mono text-sm text-yellow-400 w-full"
								value={field.key}
								onChange={(e) => updateField(field.id, { key: e.target.value })}
							/>
							<button 
								onClick={() => removeField(field.id)}
								className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
							>
								<Trash2 className="w-4 h-4" />
							</button>
						</div>

						<select 
							className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-indigo-500"
							value={field.provider}
							onChange={(e) => updateField(field.id, { provider: e.target.value })}
						>
							{COMMON_PROVIDERS.map(p => (
								<option key={p.value} value={p.value}>{p.label}</option>
							))}
						</select>
					</div>
				))}
			</div>
		</aside>
	);
};