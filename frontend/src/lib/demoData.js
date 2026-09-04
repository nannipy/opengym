// Demo data for static Vercel hosting & offline demo experience
export const DEMO_TRAINER_USER = {
  id: 'trainer-demo',
  name: 'Coach Marco (PT)',
  role: 'trainer',
  admin: true
}

export const DEMO_CLIENT_USER = {
  id: 'client-marco',
  name: 'Marco Rossi (Cliente)',
  role: 'client',
  trainerName: 'Coach Marco'
}

export const INITIAL_DEMO_CLIENTS = [
  {
    id: 'client-marco',
    name: 'Marco Rossi',
    createdAt: Date.now() - 45 * 86400000,
    workoutsCount: 24,
    totalVolume: 142500,
    lastWorkout: {
      date: Date.now() - 2 * 3600000,
      title: 'Giorno A - Spinta & Quad',
      volume: 7850,
      duration: 3420,
      sets: 18
    },
    live: false,
    notes: 'Ottima progressione sullo squat (+5kg). Nessun fastidio articolare.',
    plan: {
      routines: [
        {
          id: 'r_push_a',
          name: 'Giorno A - Spinta & Quad',
          note: 'Focus eccentrica 3 sec. RIR 1-2 sui fondamentali.',
          exercises: [
            { id: '0025', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 8, rest: 150, note: 'Fermo al petto 1s' },
            { id: '0043', name: 'Barbell Full Squat', sets: 4, reps: '6-8', rpe: 8, rest: 180, note: 'Buca il parallelo' },
            { id: '0426', name: 'Dumbbell Incline Bench Press', sets: 3, reps: '8-10', rpe: 8, rest: 120 },
            { id: '0334', name: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', rpe: 9, rest: 90 },
            { id: '0241', name: 'Cable Triceps Pushdown', sets: 3, reps: '10-12', rpe: 9, rest: 90 }
          ]
        },
        {
          id: 'r_pull_b',
          name: 'Giorno B - Trazione & Femorali',
          note: 'Mantieni schiena compatta su stacchi e rematori.',
          exercises: [
            { id: '0739', name: 'Barbell Deadlift', sets: 4, reps: '5', rpe: 8, rest: 180 },
            { id: '0027', name: 'Barbell Bent Over Row', sets: 4, reps: '6-8', rpe: 8, rest: 120 },
            { id: '1323', name: 'Pull-up', sets: 3, reps: '8-10', rpe: 8, rest: 120 },
            { id: '0031', name: 'Barbell Biceps Curl', sets: 3, reps: '10-12', rpe: 9, rest: 90 }
          ]
        },
        {
          id: 'r_legs_c',
          name: 'Giorno C - Spalle & Gambe Focus',
          note: 'Volume extra su deltoidi laterali e polpacci.',
          exercises: [
            { id: '0085', name: 'Barbell Overhead Press', sets: 4, reps: '6-8', rpe: 8, rest: 150 },
            { id: '0585', name: 'Leg Press', sets: 4, reps: '10-12', rpe: 8, rest: 120 },
            { id: '0586', name: 'Leg Curl', sets: 3, reps: '12-15', rpe: 9, rest: 90 },
            { id: '0605', name: 'Calf Press on Leg Press', sets: 4, reps: '15', rpe: 9, rest: 60 }
          ]
        }
      ],
      week: [0, null, 1, null, 2, null, null],
      note: 'Programma Ipertrofia Mesociclo 2. Carica progressivo ogni settimana sui primi 2 esercizi.'
    }
  },
  {
    id: 'client-giulia',
    name: 'Giulia Bianchi',
    createdAt: Date.now() - 30 * 86400000,
    workoutsCount: 18,
    totalVolume: 88200,
    lastWorkout: {
      date: Date.now() - 35 * 60000,
      title: 'Lower Body & Core',
      volume: 5400,
      duration: 2100,
      sets: 12
    },
    live: true, // Currently working out!
    notes: 'Focus su attivazione glutei e postura schiena.',
    plan: {
      routines: [
        {
          id: 'r_lower_g',
          name: 'Lower Body & Core',
          note: 'Massima contrazione in cima all’Hip Thrust.',
          exercises: [
            { id: '0043', name: 'Barbell Full Squat', sets: 4, reps: '8-10', rpe: 8, rest: 120 },
            { id: '0585', name: 'Leg Press', sets: 3, reps: '12', rpe: 8, rest: 90 },
            { id: '0003', name: 'Air Bike', sets: 3, reps: '20', rpe: 8, rest: 60 }
          ]
        }
      ],
      week: [0, null, 0, null, 0, null, null],
      note: 'Progressione glutei & ricomposizione corporea.'
    }
  },
  {
    id: 'client-matteo',
    name: 'Matteo Riva',
    createdAt: Date.now() - 60 * 86400000,
    workoutsCount: 32,
    totalVolume: 195000,
    lastWorkout: {
      date: Date.now() - 3 * 86400000,
      title: 'Full Body A',
      volume: 9200,
      duration: 3900,
      sets: 21
    },
    live: false,
    notes: 'Fase di forza completata con successo, passa a ipertrofia.',
    plan: {
      routines: [],
      week: [],
      note: 'In attesa di nuovo mesociclo di volume.'
    }
  }
]

export const INITIAL_DEMO_TEMPLATES = [
  {
    id: 'tmpl-push-pull-legs',
    name: 'Push / Pull / Legs (3 giorni)',
    emoji: '🔥',
    prog: 'Ipertrofia pura',
    week: [0, null, 1, null, 2, null, null],
    routines: [
      {
        id: 'tmpl_push',
        name: 'Giorno A - Push (Petto, Spalle, Tricipiti)',
        note: 'Recuperi completi sui composti, serie a cedimento solo sull’ultimo esercizio.',
        exercises: [
          { id: '0025', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 8, rest: 150 },
          { id: '0426', name: 'Dumbbell Incline Bench Press', sets: 3, reps: '8-10', rpe: 8, rest: 120 },
          { id: '0085', name: 'Barbell Overhead Press', sets: 3, reps: '8-10', rpe: 8, rest: 120 },
          { id: '0334', name: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', rpe: 9, rest: 90 },
          { id: '0241', name: 'Cable Triceps Pushdown', sets: 3, reps: '10-12', rpe: 9, rest: 90 }
        ]
      },
      {
        id: 'tmpl_pull',
        name: 'Giorno B - Pull (Dorso, Deltoidi Posteriori, Bicipiti)',
        note: 'Contrazione di picco 1s su tutte le trazioni.',
        exercises: [
          { id: '0739', name: 'Barbell Deadlift', sets: 4, reps: '5', rpe: 8, rest: 180 },
          { id: '0027', name: 'Barbell Bent Over Row', sets: 4, reps: '6-8', rpe: 8, rest: 120 },
          { id: '1323', name: 'Pull-up', sets: 3, reps: '8-10', rpe: 8, rest: 120 },
          { id: '0031', name: 'Barbell Biceps Curl', sets: 3, reps: '10-12', rpe: 9, rest: 90 }
        ]
      },
      {
        id: 'tmpl_legs',
        name: 'Giorno C - Legs (Quadricipiti, Femorali, Polpacci)',
        note: 'Squat profondo e controllo eccentrico.',
        exercises: [
          { id: '0043', name: 'Barbell Full Squat', sets: 4, reps: '6-8', rpe: 8, rest: 180 },
          { id: '0585', name: 'Leg Press', sets: 4, reps: '10-12', rpe: 8, rest: 120 },
          { id: '0586', name: 'Leg Curl', sets: 3, reps: '12-15', rpe: 9, rest: 90 },
          { id: '0605', name: 'Calf Press on Leg Press', sets: 4, reps: '15', rpe: 9, rest: 60 }
        ]
      }
    ]
  },
  {
    id: 'tmpl-upper-lower',
    name: 'Upper / Lower Split (4 giorni)',
    emoji: '⚡',
    prog: 'Forza & Massa',
    week: [0, 1, null, 0, 1, null, null],
    routines: [
      {
        id: 'tmpl_upper',
        name: 'Upper Body A',
        note: 'Focus panca e trazioni alla sbarra.',
        exercises: [
          { id: '0025', name: 'Barbell Bench Press', sets: 4, reps: '6', rpe: 8, rest: 150 },
          { id: '1323', name: 'Pull-up', sets: 4, reps: '6-8', rpe: 8, rest: 120 },
          { id: '0085', name: 'Barbell Overhead Press', sets: 3, reps: '8', rpe: 8, rest: 120 }
        ]
      },
      {
        id: 'tmpl_lower',
        name: 'Lower Body A',
        note: 'Focus squat e catena posteriore.',
        exercises: [
          { id: '0043', name: 'Barbell Full Squat', sets: 4, reps: '6', rpe: 8, rest: 180 },
          { id: '0739', name: 'Barbell Deadlift', sets: 3, reps: '5', rpe: 8, rest: 180 },
          { id: '0586', name: 'Leg Curl', sets: 3, reps: '10', rpe: 9, rest: 90 }
        ]
      }
    ]
  }
]

export const INITIAL_DEMO_CHATS = {
  'client-marco': [
    { sender: 'trainer', text: 'Ciao Marco! Come senti i doms dopo la sessione di spinta?', ts: Date.now() - 48 * 3600000 },
    { sender: 'client', text: 'Coach bene! Ho aumentato a 100kg sullo squat ieri, sensazione top!', ts: Date.now() - 47 * 3600000 },
    { sender: 'trainer', text: 'Grande! Mantieni il fermo controllato al petto sulla panca oggi.', ts: Date.now() - 24 * 3600000 },
    { sender: 'client', text: 'Perfetto, ti mando il video dell’ultima serie se non sono sicuro della traiettoria.', ts: Date.now() - 23 * 3600000 },
    { sender: 'trainer', text: 'Ottimo, ti rispondo appena lo guardo. Spingi!', ts: Date.now() - 2 * 3600000 }
  ],
  'client-giulia': [
    { sender: 'trainer', text: 'Ciao Giulia, oggi lower body con focus hip thrust!', ts: Date.now() - 5 * 3600000 },
    { sender: 'client', text: 'Ciao Coach! Sto per iniziare ora la sessione 🔥', ts: Date.now() - 35 * 60000 }
  ]
}

export function getLocalClients() {
  try {
    const raw = localStorage.getItem('gym_demo_clients')
    return raw ? JSON.parse(raw) : INITIAL_DEMO_CLIENTS
  } catch {
    return INITIAL_DEMO_CLIENTS
  }
}

export function saveLocalClients(clients) {
  try {
    localStorage.setItem('gym_demo_clients', JSON.stringify(clients))
  } catch {}
}

export function getLocalTemplates() {
  try {
    const raw = localStorage.getItem('gym_demo_templates')
    return raw ? JSON.parse(raw) : INITIAL_DEMO_TEMPLATES
  } catch {
    return INITIAL_DEMO_TEMPLATES
  }
}

export function saveLocalTemplates(tmpls) {
  try {
    localStorage.setItem('gym_demo_templates', JSON.stringify(tmpls))
  } catch {}
}

export function getLocalChat(clientId) {
  try {
    const raw = localStorage.getItem('gym_demo_chats')
    const map = raw ? JSON.parse(raw) : INITIAL_DEMO_CHATS
    return map[clientId] || []
  } catch {
    return INITIAL_DEMO_CHATS[clientId] || []
  }
}

export function appendLocalChat(clientId, message) {
  try {
    const raw = localStorage.getItem('gym_demo_chats')
    const map = raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(INITIAL_DEMO_CHATS))
    if (!map[clientId]) map[clientId] = []
    map[clientId].push(message)
    localStorage.setItem('gym_demo_chats', JSON.stringify(map))
    return map[clientId]
  } catch {
    return []
  }
}
