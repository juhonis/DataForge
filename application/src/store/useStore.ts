import { create } from 'zustand';
import { Blueprint, BlueprintField } from '../core/engine';

interface StoreState {
	blueprint: Blueprint;
	updateBlueprintName: (name: string) => void;
	addField: (field: BlueprintField) => void;
	removeField: (id: string) => void;
	updateField: (id: string, updates: Partial<BlueprintField>) => void;
}

export const useStore = create<StoreState>((set) => ({
	blueprint: {
		name: 'New E-shop Category',
		fields: [
		{ id: '1', key: 'id', provider: 'string.uuid' },
		{ id: '2', key: 'name', provider: 'commerce.productName' },
		{ id: '3', key: 'price', provider: 'commerce.price', options: { min: 100, max: 1000 } },
		]
	},

  	updateBlueprintName: (name) => 
    	set((state) => ({ blueprint: { ...state.blueprint, name } })),

	addField: (field) => 
		set((state) => ({ 
			blueprint: { ...state.blueprint, fields: [...state.blueprint.fields, field] } 
		})),

	removeField: (id) => 
		set((state) => ({ 
			blueprint: { ...state.blueprint, fields: state.blueprint.fields.filter(f => f.id !== id) } 
		})),

	updateField: (id, updates) => 
		set((state) => ({
		blueprint: {
			...state.blueprint,
			fields: state.blueprint.fields.map(f => f.id === id ? { ...f, ...updates } : f)
		}
		})),
}));