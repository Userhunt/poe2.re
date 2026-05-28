export interface RuAffix {
	id: String,
	name: string,
	regex: string
}

let cache: Map<String, Map<String, RuAffix>> = new Map;

export function loadRuAffixes(name: String): Map<String, RuAffix> {
	if (!cache.has(name)) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", "/w3e/" + name + ".json", false); 
		xhr.send();

		if (xhr.status === 200) {
			const json = JSON.parse(xhr.responseText);
			const array = json.filter((e: any) => typeof e != "string") as RuAffix[];
			const sorted = array.filter(e => e.id.length > 0);
			const map = new Map(sorted.map(e => [e.id, e]));

			cache.set(name, map);
		} else {
			throw new Error(`Не удалось загрузить /w3e/${name}.json`);
		}
	}
	return cache.get(name)!;
}