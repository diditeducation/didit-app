// Solfège note indices: 0=Do 1=Re 2=Mi 3=Fa 4=Sol 5=La 6=Ti

export const SONG_CATALOG = [
  {
    id: 'birthday',
    title: 'Happy Birthday',
    short: 'Birthday',
    emoji: '🎂',
    // Do Do Re Do Fa Mi | Do Do Re Do Sol Fa
    melody: [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3],
    toast: 'Happy Birthday! 🎂',
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle',
    short: 'Twinkle',
    emoji: '⭐',
    // Do Do Sol Sol La La Sol | Fa Fa Mi Mi Re Re Do
    melody: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
    toast: 'Twinkle Twinkle! ⭐',
  },
  {
    id: 'jingle',
    title: 'Jingle Bells',
    short: 'Jingle',
    emoji: '🔔',
    // Mi Mi Mi Mi Mi Mi | Mi Sol Do Re Mi
    melody: [2, 2, 2, 2, 2, 2, 2, 4, 0, 1, 2],
    toast: 'Jingle Bells! 🔔',
  },
  {
    id: 'mary',
    title: 'Mary Had a Little Lamb',
    short: 'Mary',
    emoji: '🐑',
    // Mary had a little lamb, little lamb little lamb
    // Mi Re Do Re Mi Mi Mi | Re Re Re Mi Re Do
    melody: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 1, 0],
    toast: 'Mary Had a Little Lamb! 🐑',
  },
  {
    id: 'oldmacdonald',
    title: 'Old MacDonald',
    short: 'MacDonald',
    emoji: '🐄',
    // Sol Sol Sol Re Mi Mi Re | Ti Ti La La Sol
    melody: [4, 4, 4, 1, 2, 2, 1, 6, 6, 5, 5, 4],
    toast: 'Old MacDonald! 🐄',
  },
  {
    id: 'alphabet',
    title: 'Alphabet Song',
    short: 'ABC',
    emoji: '🔤',
    // Do Do Sol Sol La La Sol Fa Fa Mi Mi Re Re Do
    melody: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0],
    toast: 'A B C! 🔤',
  },
  {
    id: 'wheels',
    title: 'Wheels on the Bus',
    short: 'Wheels',
    emoji: '🚌',
    // Do Do Do Do Mi Sol Mi Do Sol Mi Do Sol Mi Do
    melody: [0, 0, 0, 0, 2, 4, 2, 0, 4, 2, 0, 4, 2, 0],
    toast: 'Wheels on the Bus! 🚌',
  },
];
