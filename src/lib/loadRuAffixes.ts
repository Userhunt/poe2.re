export interface RuAffix {
	id: String,
	name: string,
	regex: string
}

let cache: Map<String, Map<String, RuAffix>> = new Map;

export function loadRuAffixes(name: String): Map<String, RuAffix> {
	if (!cache.has(name)) {
		try {
			const xhr = new XMLHttpRequest();
			let path: string = `${window.location.origin}/poe2.re/w3e/` + name + ".json";
			xhr.open("GET", path, false); 
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
		} catch (error: unknown) { // Тип unknown гарантирует безопасность
			if (error instanceof Error) {
			  // Внутри этого блока TS знает, что error — это объект Error
			  console.error("Имя ошибки:", error.name);
			  console.error("Сообщение:", error.message);
			} else {
			  // На случай, если кто-то выбросил не Error, а строку: throw "ошибка"
			  console.error("Произошло что-то странное:", error);
			}
		  }
	}
	return cache.get(name)!;
}