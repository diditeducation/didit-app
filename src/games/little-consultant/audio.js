// Little Consultant — re-uses the Little Pianist audio helpers so we
// don't duplicate WebAudio plumbing.

import { initAudio as pianistInit, sound as pianistSound } from '../little-pianist/audio';

export const initAudio = pianistInit;

export const sound = {
  // Soft thump when a shape lands in the correct home.
  thunk:     () => pianistSound.kick(),
  // Non-punitive bounce-back.
  boop:      () => pianistSound.boing(),
  // Ascending ping per home filling up.
  ping:      () => pianistSound.chime(),
  // Big stinger at level/game completion.
  celebrate: () => pianistSound.levelComplete(),
};
