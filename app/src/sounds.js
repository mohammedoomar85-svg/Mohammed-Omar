import { speak } from './ui';

// Animal sounds for the "Who's that sound?" game.
//
// TRIAL VERSION: for now the device voice says each sound (e.g. "Mooo").
// When the real recordings arrive, put the files in app/assets/sounds/ (cow.mp3, sheep.mp3 …),
// set `file: require('../assets/sounds/cow.mp3')` below, and the game will play the recording instead.
export const TRIAL_SOUNDS = true;

export const ANIMALS = [
  { id: 'cow', pic: '🐄', ar: 'البقرة', en: 'cow', say: { ar: 'مووووو', en: 'Moooo' }, file: null },
  { id: 'sheep', pic: '🐑', ar: 'الخروف', en: 'sheep', say: { ar: 'ماااااء', en: 'Baaaa' }, file: null },
  { id: 'cat', pic: '🐱', ar: 'القطوة', en: 'cat', say: { ar: 'مياااو', en: 'Meeeow' }, file: null },
  { id: 'dog', pic: '🐶', ar: 'الكلب', en: 'dog', say: { ar: 'هاو هاو', en: 'Woof woof' }, file: null },
  { id: 'duck', pic: '🦆', ar: 'البطة', en: 'duck', say: { ar: 'كواك كواك', en: 'Quack quack' }, file: null },
  { id: 'rooster', pic: '🐓', ar: 'الديك', en: 'rooster', say: { ar: 'كوكوكوكو', en: 'Cock-a-doodle-doo' }, file: null },
  { id: 'lion', pic: '🦁', ar: 'الأسد', en: 'lion', say: { ar: 'غرررر', en: 'Roarrr' }, file: null },
  { id: 'bee', pic: '🐝', ar: 'النحلة', en: 'bee', say: { ar: 'بززززز', en: 'Bzzzzz' }, file: null },
  { id: 'owl', pic: '🦉', ar: 'البومة', en: 'owl', say: { ar: 'هوو هوو', en: 'Hoo hoo' }, file: null },
  { id: 'frog', pic: '🐸', ar: 'الضفدع', en: 'frog', say: { ar: 'نق نق', en: 'Ribbit' }, file: null },
  { id: 'donkey', pic: '🫏', ar: 'الحمار', en: 'donkey', say: { ar: 'هي هو', en: 'Hee-haw' }, file: null },
  { id: 'horse', pic: '🐴', ar: 'الحصان', en: 'horse', say: { ar: 'هييييه', en: 'Neeeigh' }, file: null },
];

// Plays an animal's sound. Today that's the device voice; later the recording.
export function playAnimal(animal, lang, enabled = true) {
  speak(animal.say[lang], lang, enabled);
}
