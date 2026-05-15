#!/usr/bin/env node
// translations.json 사전을 사용해 reading/listening 데이터의 일본어 prompt·choices를 한국어로 교체.
// 매핑 없는 항목은 일본어 유지 (안전).

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data");

const T = JSON.parse(fs.readFileSync(path.join(ROOT, "scripts", "translations.json"), "utf8"));
const reading = JSON.parse(fs.readFileSync(path.join(DATA, "reading.json"), "utf8"));
const listening = JSON.parse(fs.readFileSync(path.join(DATA, "listening.json"), "utf8"));

let promptTranslated = 0, promptMissed = 0;
let choiceTranslated = 0, choiceMissed = 0;
const missingPrompts = new Set();
const missingChoices = new Set();

function processItem(it) {
  for (const q of it.questions) {
    // prompt
    if (/[぀-ゟ゠-ヿ一-鿿]/.test(q.prompt)) {
      const ko = T.prompts[q.prompt];
      if (ko) { q.prompt = ko; promptTranslated++; }
      else { missingPrompts.add(q.prompt); promptMissed++; }
    }
    // choices
    q.choices = q.choices.map(c => {
      if (!/[぀-ゟ゠-ヿ一-鿿]/.test(c)) return c;
      const ko = T.choices[c];
      if (ko) { choiceTranslated++; return ko; }
      missingChoices.add(c);
      choiceMissed++;
      return c;
    });
  }
}

reading.items.forEach(processItem);
listening.items.forEach(processItem);

fs.writeFileSync(path.join(DATA, "reading.json"), JSON.stringify(reading, null, 2));
fs.writeFileSync(path.join(DATA, "listening.json"), JSON.stringify(listening, null, 2));

console.log("==== Translation summary ====");
console.log(`Prompts : translated ${promptTranslated}, missing ${promptMissed}`);
console.log(`Choices : translated ${choiceTranslated}, missing ${choiceMissed}`);
if (missingPrompts.size > 0) {
  console.log("\n--- Missing prompts ---");
  [...missingPrompts].forEach(p => console.log(" ", p));
}
if (missingChoices.size > 0) {
  console.log("\n--- Missing choices ---");
  [...missingChoices].forEach(c => console.log(" ", c));
}
