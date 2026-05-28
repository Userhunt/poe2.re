import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VENDOR_ALL_FILE = path.join(__dirname, "../public/w3e/vendor-all.json");
const VENDOR_FILE = path.join(__dirname, "../public/w3e/vendor.json");
const VENDOR_TYPE_FILE = path.join(__dirname, "../public/w3e/vendor-type.json");

const MIN_LEN = 2
const MAX_LEN = 10

function loadTokens(file) {
	const data = JSON.parse(fs.readFileSync(file, "utf-8"));
	return data;
}

function writeJson(filePath, mapping) {
	fs.writeFileSync(filePath, JSON.stringify(mapping, null, 2) + "\n", "utf-8");
	//console.log(`Output: ${filePath}`);
}

function extractUniqueMarkers(jsonObject) {
	// 1. Парсим JSON, если он передан строкой, либо работаем с массивом
	const phrases = typeof jsonObject === 'string' ? JSON.parse(jsonObject) : jsonObject;

	// Справочник для подсчета частоты каждого сочетания символов во всех фразах
	const substringCounts = {};
	let substringWords = new Set();

	// 2. ШАГ 1: Собираем статистику по всем фразам
	jsonObject.forEach(value => {
		const seenInPhrase = new Set();

		slice(value, (word) => {
			seenInPhrase.add(word);
			return false;
		})
		substringWords.add(seenInPhrase);
		
		/*// Увеличиваем счетчик в глобальной базе
		seenInPhrase.forEach(sub => {
			substringCounts[sub] = (substringCounts[sub] || 0) + 1;
		});*/
	});

	// 3. Шаг 2: Удаляем ключи содержащиеся в других ключах
	substringWords.forEach(sub0 => {
		sub0.forEach(s0 => {
			let error = false;
			substringWords.forEach(sub1 => {
				if (sub0 == sub1) {
					return;
				}
				sub1.forEach(s1 => {
					if (s1 === s0 || s1.includes(s0)) {
						error = true;
					}
				});
			})
			if (!error) {
				substringCounts[s0] = (substringCounts[s0] || 0) + 1;
			}
		})
	});

	// 3. ШАГ 2: Для каждой фразы находим её уникальный или самый редкий ключ
	jsonObject.forEach(value => {
		if (typeof value === "string") {
			return;
		}
		let bestMarker = null;
		let minFrequency = Infinity;

		let ml = Infinity;

		slice(value, (word) => {
			const freq = substringCounts[word];

			// Если уникального нет, запоминаем самое редкое из существующих
			if (freq < minFrequency) {
				if (word.length < ml) {
					ml = word.length;
					bestMarker = word;
				}
				minFrequency = freq;
			}

			if (MIN_LEN <= ml && freq === 1) {
				return false;
			}
			return true;
		});

		value.regex = bestMarker;
	});

	return phrases;
}

function slice(value, action) {
	let phrase = value;
	if (typeof value !== "string") {
		phrase = value.source;
	}
	
	let index = phrase.indexOf("#");

	let required = false;
	if (typeof value !== "string") {
		required = value.required && index >= 0;
	}
	if (required) {
		for (let len = MIN_LEN; len <= MAX_LEN; len++) {
			for (let i = 0; i <= phrase.length - len; i++) {
				const start = i;
				const end = i + len;
				const sub = phrase.substring(start, end);
				if (sub.includes("$") && sub.length <= MIN_LEN) {
					continue;
				}
	
				// СЛУЧАЙ 1: '#' внутри окна
				if (index >= start && index < end && len > MIN_LEN + 1) {
					//if (action(sub)) return;
				} 
				// СЛУЧАЙ 2: '#' находится ПОСЛЕ окна (справа)
				else if (index >= end) {
					const distance = index - end;
					if (distance === 0) {
						//action(sub);
					} else if (distance === 1) {
						action(sub + phrase[end]);
					} else {
						action(sub + ".+");
					}
				} 
				// СЛУЧАЙ 3: '#' находится ДО окна (слева)
				else if (index < start) {
					const distance = start - (index + 1);
					if (distance === 0) {
						//action(sub);
					} else if (distance === 1) {
						action(phrase[start - 1] + sub);
					} else {
						action('.+' + sub);
					}
				}
			}
		}
	} else {
		// Нарезаем фразу на подстроки заданной длины
		for (let len = MIN_LEN; len <= MAX_LEN; len++) {
			for (let i = 0; i <= phrase.length - len; i++) {
				const sub = phrase.substring(i, i + len);
				if (sub.includes("$") && sub.length <= MIN_LEN) {
					continue;
				}
				action(sub); // Set гарантирует, что мы не посчитаем дубли внутри одной фразы
			}
		}
	}
}


// Запуск алгоритма
async function main() {
	calculateFile(VENDOR_FILE, VENDOR_ALL_FILE, "vendor");
	calculateFile(VENDOR_TYPE_FILE, VENDOR_ALL_FILE, "vendor-type");
}

function calculateFile(file, fileAll, message) {
	var json0 = loadTokens(file);
	var json1 = loadTokens(fileAll);
	json1.forEach(e => {
		json0.push(e);
	})
	const outputJson = extractUniqueMarkers(json0);

	const result = outputJson.filter(mainItem => {
		// Проверяем, есть ли такой id во втором массиве
		const isDuplicate = json1.some(removeItem => removeItem === mainItem);
		
		// Оставляем только те, которых НЕТ во втором массиве
		return !isDuplicate;
	});

	console.log(`Parsed ${result.length} ` + message);

	writeJson(file, result);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});