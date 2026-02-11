import { faker } from '@faker-js/faker';

export interface BlueprintField {
	id: string;
	key: string;
	provider: string; // e.g., "commerce.price"
	options?: any;
}

export interface Blueprint {
	name: string;
	fields: BlueprintField[];
}

export const generateData = (blueprint: Blueprint, count: number): any[] => {
	return Array.from({ length: count }).map(() => {
		const record: Record<string, any> = {};
		
		blueprint.fields.forEach(field => {
		const [module, method] = field.provider.split('.') as [keyof typeof faker, any];
		
		try {
			const fakerModule = faker[module] as any;
			record[field.key] = fakerModule[method](field.options || {});
		} catch (err) {
			record[field.key] = `Error: ${field.provider} not found`;
		}
		});
		
		return record;
	});
};