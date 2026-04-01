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
    id: 'rowrow',
    title: 'Row Your Boat',
    short: 'Row Row',
    emoji: '🚣',
    // Do Do Do Re Mi | Mi Re Mi Fa Sol
    melody: [0, 0, 0, 1, 2, 2, 1, 2, 3, 4],
    toast: 'Row Your Boat! 🚣',
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
    id: 'itsybitsy',
    title: 'Itsy Bitsy Spider',
    short: 'Itsy',
    emoji: '🕷️',
    // Sol Sol La Sol Mi | Sol Mi Do Re Mi
    melody: [4, 4, 5, 4, 2, 4, 2, 0, 1, 2],
    toast: 'Itsy Bitsy! 🕷️',
  },
  {
    id: 'happyhappy',
    title: "If You're Happy",
    short: 'Happy',
    emoji: '😊',
    // Sol Sol Sol Mi Sol Fa Mi Do | Sol Sol
    melody: [4, 4, 4, 2, 4, 3, 2, 0, 4, 4],
    toast: "If You're Happy! 😊",
  },
  {
    id: 'rosie',
    title: 'Ring Around the Rosie',
    short: 'Rosie',
    emoji: '💐',
    // Mi Mi Mi Mi Re | Mi Mi Sol Mi Re Do
    melody: [2, 2, 2, 2, 1, 2, 2, 4, 2, 1, 0],
    toast: 'Ring Around the Rosie! 💐',
  },
];
