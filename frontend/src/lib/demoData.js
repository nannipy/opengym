// Rich demo data for static Vercel hosting & offline demo experience
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
          name: 'Giorno C - Spalle & Braccia Focus',
          note: 'Volume extra su deltoidi e braccia.',
          exercises: [
            { id: '0085', name: 'Barbell Overhead Press', sets: 4, reps: '6-8', rpe: 8, rest: 150 },
            { id: '0585', name: 'Leg Press', sets: 4, reps: '10-12', rpe: 8, rest: 120 },
            { id: '0586', name: 'Leg Curl', sets: 3, reps: '12-15', rpe: 9, rest: 90 }
          ]
        }
      ],
      week: [0, null, 1, null, 2, null, null],
      note: 'Programma Ipertrofia Mesociclo 2. Carico progressivo e tecnica controllata.'
    },
    weights: [
      { d: '2026-08-01', w: 80.5 },
      { d: '2026-08-10', w: 80.0 },
      { d: '2026-08-20', w: 79.4 },
      { d: '2026-08-30', w: 78.8 },
      { d: '2026-09-04', w: 78.2 }
    ]
  },
  {
    id: 'client-giulia',
    name: 'Giulia Bianchi',
    createdAt: Date.now() - 30 * 86400000,
    workoutsCount: 18,
    totalVolume: 88200,
    lastWorkout: {
      date: Date.now() - 25 * 60000,
      title: 'Lower Body & Glutei Focus',
      volume: 5400,
      duration: 2100,
      sets: 12
    },
    live: true, // Currently working out in gym!
    notes: 'Ottima attivazione glutei. Monitorare stacco a gambe tese.',
    plan: {
      routines: [
        {
          id: 'r_lower_g',
          name: 'Giorno 1 - Glutei & Catena Posteriore',
          note: 'Contrazione di picco in cima ad ogni rep.',
          exercises: [
            { id: '0043', name: 'Barbell Full Squat', sets: 4, reps: '8-10', rpe: 8, rest: 120, note: 'Discesa in 3 secondi' },
            { id: '0585', name: 'Leg Press', sets: 3, reps: '12', rpe: 8, rest: 90, note: 'Piedi alti sulla pedana' },
            { id: '0586', name: 'Leg Curl', sets: 3, reps: '12-15', rpe: 9, rest: 90 },
            { id: '0003', name: 'Air Bike', sets: 3, reps: '20', rpe: 8, rest: 60 }
          ]
        },
        {
          id: 'r_upper_g',
          name: 'Giorno 2 - Upper Body & Core',
          note: 'Tono spalle e dorso per postura ideale.',
          exercises: [
            { id: '0426', name: 'Dumbbell Incline Bench Press', sets: 3, reps: '10', rpe: 8, rest: 90 },
            { id: '0027', name: 'Barbell Bent Over Row', sets: 3, reps: '10-12', rpe: 8, rest: 90 },
            { id: '0334', name: 'Dumbbell Lateral Raise', sets: 3, reps: '15', rpe: 9, rest: 60 }
          ]
        }
      ],
      week: [0, null, 1, null, 0, null, null],
      note: 'Scheda Tonificazione & Glutei. Focus su tecnica e recupero 90 secondi.'
    },
    weights: [
      { d: '2026-08-05', w: 60.2 },
      { d: '2026-08-18', w: 59.7 },
      { d: '2026-09-02', w: 59.1 }
    ]
  },
  {
    id: 'client-alessandro',
    name: 'Alessandro Moretti',
    createdAt: Date.now() - 90 * 86400000,
    workoutsCount: 45,
    totalVolume: 284000,
    lastWorkout: {
      date: Date.now() - 22 * 3600000,
      title: 'Heavy Bench & Upper Power',
      volume: 11400,
      duration: 4100,
      sets: 22
    },
    live: false,
    notes: 'Panca piana a 115kg superata con facilità. Prossimo test massimale tra 2 settimane.',
    plan: {
      routines: [
        {
          id: 'r_power_bench',
          name: 'Panca Pesante & Accessori',
          note: 'Arco compatto, leg drive attivo su ogni ripetizione.',
          exercises: [
            { id: '0025', name: 'Barbell Bench Press', sets: 5, reps: '3-5', rpe: 9, rest: 180, note: 'Serie target 115kg' },
            { id: '0085', name: 'Barbell Overhead Press', sets: 4, reps: '6', rpe: 8, rest: 150 },
            { id: '0426', name: 'Dumbbell Incline Bench Press', sets: 4, reps: '8', rpe: 8, rest: 120 }
          ]
        }
      ],
      week: [0, null, 0, null, 0, null, null],
      note: 'Ciclo Powerbuilding Avanzato - RIR 1 sui fondamentali.'
    }
  },
  {
    id: 'client-sara',
    name: 'Sara Conti',
    createdAt: Date.now() - 25 * 86400000,
    workoutsCount: 14,
    totalVolume: 62400,
    lastWorkout: {
      date: Date.now() - 1 * 86400000,
      title: 'Full Body Ricomposizione A',
      volume: 4900,
      duration: 2700,
      sets: 15
    },
    live: false,
    notes: 'Costanza esemplare. Peso in calo costante (-2.7kg) con aumento di forza percepita.',
    plan: {
      routines: [
        {
          id: 'r_sara_fb',
          name: 'Full Body Circuit & Metcon',
          note: 'Recuperi brevi, intensità aerobica controllata.',
          exercises: [
            { id: '0043', name: 'Barbell Full Squat', sets: 3, reps: '10', rpe: 7, rest: 90 },
            { id: '0001', name: '3/4 Sit-up', sets: 4, reps: '15', rpe: 8, rest: 45 },
            { id: '0003', name: 'Air Bike', sets: 3, reps: '25', rpe: 8, rest: 45 }
          ]
        }
      ],
      week: [0, null, 0, null, 0, null, null],
      note: 'Ricomposizione & Definizione. Mantieni l’apporto idrico sopra 2.5L.'
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
      title: 'Giorno B - Stacco & Dorso',
      volume: 9200,
      duration: 3900,
      sets: 21
    },
    live: false,
    notes: 'Ha chiesto di sostituire le croci ai cavi con manubri se i cavi sono occupati.',
    plan: {
      routines: [
        {
          id: 'r_matteo_back',
          name: 'Stacco & Dorso Spessore',
          note: 'Occhio alla lordosi lombare sulla fase di ripartenza.',
          exercises: [
            { id: '0739', name: 'Barbell Deadlift', sets: 4, reps: '5', rpe: 8, rest: 180 },
            { id: '0027', name: 'Barbell Bent Over Row', sets: 4, reps: '8', rpe: 8, rest: 120 },
            { id: '1323', name: 'Pull-up', sets: 3, reps: '8', rpe: 9, rest: 120 }
          ]
        }
      ],
      week: [0, null, 0, null, null, null, null],
      note: 'Mesociclo Densità. In transizione a scheda 4 giorni.'
    }
  },
  {
    id: 'client-elena',
    name: 'Elena Ferri',
    createdAt: Date.now() - 14 * 86400000,
    workoutsCount: 9,
    totalVolume: 38500,
    lastWorkout: {
      date: Date.now() - 4 * 86400000,
      title: 'Postura & Core Focus',
      volume: 3800,
      duration: 2400,
      sets: 14
    },
    live: false,
    notes: 'Ottimi miglioramenti sulla mobilità delle anche e della caviglia.',
    plan: {
      routines: [
        {
          id: 'r_elena_post',
          name: 'Mobilità & Tonificazione',
          note: 'Esegui il riscaldamento articolare per 8 minuti prima dei carichi.',
          exercises: [
            { id: '1512', name: 'All Fours Squad Stretch', sets: 3, reps: '30s', rpe: 6, rest: 30 },
            { id: '0002', name: '45° Side Bend', sets: 3, reps: '12', rpe: 7, rest: 60 }
          ]
        }
      ],
      week: [0, null, 0, null, null, null, null],
      note: 'Mobilità e riequilibrio muscolare.'
    }
  },
  {
    id: 'client-federico',
    name: 'Federico De Luca',
    createdAt: Date.now() - 1 * 86400000,
    workoutsCount: 0,
    totalVolume: 0,
    lastWorkout: null,
    live: false,
    notes: 'Nuovo atleta registrato con Passkey. In attesa della prima anamnesi e scheda.',
    plan: {
      routines: [],
      week: [],
      note: 'Da assegnare template scheda iniziale.'
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
          { id: '0025', name: 'Barbell Bench Press', sets: 4, reps: '6-8', rpe: 8, rest: 150, note: 'Fermo al petto 1s' },
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
    { sender: 'client', text: 'Ciao Coach! Sto per iniziare ora la sessione 🔥', ts: Date.now() - 25 * 60000 }
  ],
  'client-alessandro': [
    { sender: 'client', text: 'Coach la panca a 115kg è salita fluida, RPE 8.5!', ts: Date.now() - 21 * 3600000 },
    { sender: 'trainer', text: 'Visto il video, traiettoria perfetta e gomiti ben serrati. Settimana prossima proviamo 117.5kg!', ts: Date.now() - 20 * 3600000 }
  ],
  'client-sara': [
    { sender: 'client', text: 'Coach peso stamattina a 61.8kg! Mi vedo molto più tonica sulle gambe.', ts: Date.now() - 28 * 3600000 },
    { sender: 'trainer', text: 'Bravissima Sara! Il deficit moderato e i carichi costanti stanno funzionando alla grande.', ts: Date.now() - 27 * 3600000 }
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

export function setupClientDemoState(useStoreState) {
  const clientData = INITIAL_DEMO_CLIENTS[0] // Marco Rossi
  localStorage.setItem('gym_user', JSON.stringify(DEMO_CLIENT_USER))
  localStorage.removeItem('gym_guest')

  useStoreState.update(s => {
    s.plan = clientData.plan
    s.targetWeight = 78
    s.weightUnit = 'kg'
    s.lang = 'it'
    s.theme = s.theme || 'light' // Default to light or keep
  })
}

export function setupTrainerDemoState(useStoreState) {
  localStorage.setItem('gym_user', JSON.stringify(DEMO_TRAINER_USER))
  localStorage.removeItem('gym_guest')
}
