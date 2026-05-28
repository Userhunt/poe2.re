import {Settings} from "@/app/settings.ts";

import {loadRuAffixes, RuAffix} from "@/lib/loadRuAffixes.ts";

const names: Map<String, RuAffix> = loadRuAffixes("vendor");
const name_types: Map<String, RuAffix> = loadRuAffixes("vendor-type");

export function generateVendorRegex(settings: Settings): string {
  const terms = [
    ...itemProperty(settings.vendor.itemProperty),
    itemType(settings.vendor.itemType),
    itemLevel(settings.vendor.itemLevel),
    characterLevel(settings.vendor.characterLevel),
    resistances(settings.vendor.resistances),
    movement(settings.vendor.movementSpeed),
    ...itemMods(settings.vendor.itemMods),
    settings.vendor.resultSettings.customText || null,
    itemClass(settings.vendor.itemClass),
  ].filter((e) => e !== null && e !== "")

  return terms.length > 0 ? `"${terms.join("|")}"` : "";
}


function itemProperty(settings: Settings["vendor"]["itemProperty"]): (string | null)[] {
  return [
    settings.quality ? names.get("quality")!.regex : null,
    settings.sockets ? names.get("sockets")!.regex : null,
  ].filter((e) => e !== null)
}

function itemType(settings: Settings["vendor"]["itemType"]): string | null {
  const types = [
    settings.rare ? names.get("Rare")!.regex : null,
    settings.magic ? names.get("Magic")!.regex : null,
    settings.normal ? names.get("Normal")!.regex : null,
  ].filter((e) => e !== null);

  if (types.length === 0 || types.length === 3) return null;
  if (types.length > 1) return `(${types.join("|")})`
  return `${types.join("|")}`;
}

function resistances(settings: Settings["vendor"]["resistances"]): string | null {
  const res = [
    settings.fire ? names.get("FireResistance")!.regex : null,
    settings.cold ? names.get("ColdResistance")!.regex : null,
    settings.lightning ? names.get("LightningResistance")!.regex : null,
    settings.chaos ? names.get("ChaosResistance")!.regex : null,
  ].filter((e) => e !== null);

  if (res.length === 0) return null;
  let regex = name_types.get("resistance")!.regex;
  if (res.length === 4) return regex;
  if (res.length > 1) return regex + `.+(${res.join("|")})`;

  return regex + `.+${res.join("|")}`;
}

function movement(settings: Settings["vendor"]["movementSpeed"]): string | null {
  const move0 = [
    settings.move30 ? "30" : null,
    settings.move20 ? "20" : null,
    settings.move10 ? "10" : null,
  ].filter((e) => e !== null)
  const move5 = [
    settings.move25 ? "25" : null,
    settings.move15 ? "15" : null,
  ].filter((e) => e !== null)

  const regex = names.get("MovementSpeed")!.regex;

  const numOfSelected = move0.length + move5.length;
  if (numOfSelected === 0) return null;
  if (numOfSelected === 1) return `${[move0, move5].join("")}% ` + regex;
  if (numOfSelected === 5) return `\\d+% ` + regex;

  const zeros = move0.length > 1 ?
    `[${move0.map((e) => e[0]).join("")}]0`
    : move0.join("|");
  const fives = move5.length > 1 ?
    `[${move5.map((e) => e[0]).join("")}]5`
    : move5.join("|");
  return `(${[zeros, fives].filter((e) => e !== null && e !== "").join("|")})% ` + regex;
}

function itemMods(settings: Settings["vendor"]["itemMods"]): (string | null)[] {
  const eleDamage = [
    settings.coldDamage ? names.get("FireDamage")!.regex : null,
    settings.chaosDamage ? names.get("ChaosDamage")!.regex : null,
    settings.fireDamage ? names.get("LightningDamage")!.regex : null,
    settings.lightningDamage? names.get("ColdDamage")!.regex : null,
  ].filter((e) => e !== null).join("|");

  const eleString = eleDamage.includes("|") ? `(${eleDamage})` : `${eleDamage}`;

  const attributes = [
    settings.strength ? "str" : null,
    settings.dexterity ? "d" : null,
    settings.intelligence ? "int" : null,
  ].filter((e) => e !== null).join("|")

  return [
    settings.physical ? names.get("PhysicalDamage")!.regex : null,
    settings.spellDamage ? names.get("SpellDamage")!.regex : null,
    eleDamage ? `${eleString}` : null,
    settings.skillLevel ? names.get("AllSkillLvl")!.regex : null,
    settings.skillLevelMinion ? names.get("MinionSkillLvl")!.regex : null,
    settings.skillLevelMelee ? "^\\+.*ee skills$" : null,
    settings.skillLevelSpell ? names.get("SpellSkillLvl")!.regex : null,
    settings.skillLevelFire ? names.get("FireSpellSkillLvl")!.regex : null,
    settings.skillLevelCold ? names.get("ColdSpellSkillLvl")!.regex : null,
    settings.skillLevelLightning ? names.get("LightningSpellSkillLvl")!.regex : null,
    settings.skillLevelPhysical ? names.get("PhysicalSpellSkillLvl")!.regex : null,
    settings.skillLevelProjectile ? "^\\+.*ile skills$" : null,
    settings.spirit ? names.get("Spirit")!.regex : null,
    settings.rarity ? names.get("IncreasedRarity")!.regex : null,
    settings.attackSpeed ? names.get("AttackSpeed")!.regex : null,
    settings.castSpeed ? names.get("CastSpeed")!.regex : null,
    settings.maxLife ? names.get("MaximumLife")!.regex : null,
    settings.maxMana ? names.get("MaximumMana")!.regex : null,
    attributes ? `o (all a|${attributes})` : null
  ].filter((e) => e !== null)
}

function itemClass(settings: Settings["vendor"]["itemClass"]): string | null {
  const itemClasses = [
    settings.amulets ? "am" : null,
    settings.rings ? "ri" : null,
    settings.belts ? "be" : null,
    settings.daggers ? "da" : null,
    settings.wands ? "wa" : null,
    settings.oneHandMaces ? "on" : null,
    settings.sceptres ? "sc" : null,
    settings.bows ? "bow" : null,
    settings.staves ? "st" : null,
    settings.twoHandMaces ? "tw" : null,
    settings.quarterstaves ? "qua" : null,
    settings.spears ? "spe" : null,
    settings.crossbows ? "cr" : null,
    settings.talisman ? "tali" : null,
    settings.gloves ? "gl" : null,
    settings.boots ? "boo" : null,
    settings.bodyArmours ? "bod" : null,
    settings.helmets ? "he" : null,
    settings.quivers ? "qui" : null,
    settings.foci ? "fo" : null,
    settings.shields ? "sh" : null,
  ].filter((e) => e !== null);

  if (itemClasses.length === 0) return null;
  if (itemClasses.length === 1) return `s: ${itemClasses.join("")}`
  return `s: (${itemClasses.join("|")})`;
}

function itemLevel(settings: Settings["vendor"]["itemLevel"]): string | null {
  return createLevelRangeRegex(settings.min, settings.max, "m level: ");
}

function characterLevel(settings: Settings["vendor"]["characterLevel"]): string | null {
  return createLevelRangeRegex(settings.min, settings.max, "s: level ");
}

function createLevelRangeRegex(min: number, max: number, prefix: string): string | null {
  // No filter if both are zero.
  if (min === 0 && max === 0) {
    return null;
  }

  // If a valid maximum is provided but min is greater than max, return null.
  if (max > 0 && min > max) {
    return null;
  }

  // Use an upper bound – for item levels we assume a maximum of 99 if none is provided.
  const effectiveMax = max === 0 ? 99 : max;

  // Simple cases first
  if (min === 0 && effectiveMax === 99) {
    return `${prefix}(\\d{1,2})\\b`;
  }
  
  if (min > 0 && min === effectiveMax) {
    // Exact match
    return `${prefix}(${min})\\b`;
  }
  // Handle specific ranges more efficiently
  const singleDigits = min <= 9 ? rangePattern(min, Math.min(9, effectiveMax)) : "";
  const tens = Math.floor(Math.min(Math.max(min, 10), effectiveMax) / 10);
  const maxTens = Math.floor(effectiveMax / 10);
  
  const patterns = [];
  
  // Add single digit pattern if applicable
  if (singleDigits) {
    patterns.push(singleDigits);
  }
  
  // Handle ranges spanning tens more efficiently
  if (tens <= maxTens) {
    // Different tens groups
    if (tens === maxTens) {
      // Same tens group (e.g., 10-19)
      const minOnes = min > 9 ? min % 10 : 0;
      const maxOnes = effectiveMax % 10;
      patterns.push(`${tens}[${minOnes}-${maxOnes}]`);
    } else {
      // Starting tens group
      if (min <= tens * 10 + 9 && min > tens * 10) {
        const minOnes = min % 10;
        patterns.push(`${tens}[${minOnes}-9]`);
      } else if (min <= tens * 10) {
        patterns.push(`${tens}\\d`);
      }
      
      // Full tens groups in the middle
      if (maxTens > tens + 1) {
        patterns.push(`[${tens + 1}-${maxTens - 1}]\\d`);
      }
      
      // Final tens group
      if (effectiveMax % 10 > 0) {
        patterns.push(`${maxTens}[0-${effectiveMax % 10}]`);
      } else {
        patterns.push(`${maxTens}0`);
      }
    }
  }

  return `${prefix}(${patterns.join("|")})\\b`;
}

// Helper function to create regex pattern for a range of numbers
function rangePattern(start: number, end: number): string {
  if (start > end) return "";
  if (start === end) return start.toString();
  if (start === 0 && end === 9) return "\\d";
  return `[${start}-${end}]`;
}