export const WORD_MODES = {
  easy: {
    label: 'Easy',
    description: 'Everyday concrete words',
    words: [
      'apple', 'beach', 'bread', 'chair', 'dance', 'dream', 'earth', 'flame', 'glass', 'grain',
      'grape', 'grass', 'heart', 'honey', 'house', 'juice', 'laugh', 'lemon', 'light', 'maple',
      'metal', 'money', 'moon', 'music', 'night', 'ocean', 'paint', 'paper', 'peace', 'phone',
      'piano', 'plant', 'queen', 'radio', 'river', 'salad', 'sheep', 'shell', 'shirt', 'sleep',
      'smile', 'smoke', 'snake', 'snow', 'space', 'spice', 'sport', 'stage', 'stamp', 'star',
      'steam', 'steel', 'stone', 'storm', 'story', 'stove', 'sugar', 'table', 'taste', 'tiger',
      'toast', 'tower', 'train', 'treat', 'truck', 'trust', 'truth', 'video', 'voice', 'watch',
      'water', 'whale', 'wheat', 'wheel', 'white', 'world', 'youth', 'angel', 'brain', 'brick',
      'brush', 'candy', 'cards', 'charm', 'chess', 'child', 'chips', 'city', 'cloud', 'clown',
      'coach', 'coast', 'coral', 'coffee', 'cookie', 'garden', 'hammer', 'jacket', 'kitten', 'ladder',
      'mirror', 'needle', 'orange', 'pencil', 'pillow', 'rocket', 'saddle', 'tunnel', 'window', 'zebra'
    ]
  },
  medium: {
    label: 'Medium',
    description: 'Trickier everyday & abstract words',
    words: [
      'anchor', 'beacon', 'border', 'bridge', 'bronze', 'bubble', 'burden', 'candle', 'canyon', 'castle',
      'cipher', 'circle', 'climax', 'colony', 'compass', 'copper', 'cradle', 'crater', 'crisis', 'crown',
      'custom', 'dagger', 'desert', 'device', 'domain', 'dragon', 'echo', 'ember', 'engine', 'fabric',
      'famine', 'feather', 'filter', 'forest', 'fortune', 'fossil', 'galaxy', 'glacier', 'harbor', 'harvest',
      'hazard', 'hollow', 'horizon', 'hunger', 'island', 'jungle', 'kettle', 'knight', 'lantern', 'legend',
      'liquid', 'magnet', 'marble', 'meadow', 'memory', 'meteor', 'mineral', 'miracle', 'moment', 'monster',
      'mosaic', 'museum', 'nectar', 'notion', 'oracle', 'orbit', 'orphan', 'oxygen', 'palace', 'parcel',
      'passage', 'pattern', 'pillar', 'pirate', 'plague', 'planet', 'pocket', 'poison', 'portal', 'prism',
      'puzzle', 'quarry', 'riddle', 'ritual', 'rival', 'safari', 'sapphire', 'shadow', 'signal', 'silence',
      'silver', 'spirit', 'statue', 'summit', 'symbol', 'temple', 'thunder', 'timber', 'treasure', 'valley',
      'velvet', 'vessel', 'village', 'volcano', 'voyage', 'weapon', 'whisper', 'wilderness', 'wonder', 'zenith'
    ]
  },
  hard: {
    label: 'Hard',
    description: 'Abstract & uncommon words',
    words: [
      'alchemy', 'anomaly', 'apology', 'archive', 'asylum', 'balance', 'barrier', 'betrayal', 'calculus', 'cascade',
      'catalyst', 'cathedral', 'chronicle', 'clarity', 'collapse', 'compassion', 'complex', 'conduit', 'conflict', 'consensus',
      'contrast', 'corridor', 'crescent', 'critique', 'currency', 'destiny', 'dialogue', 'doctrine', 'eclipse', 'elegance',
      'embers', 'enigma', 'entropy', 'epitaph', 'essence', 'exile', 'facet', 'fracture', 'fragment', 'frontier',
      'genesis', 'gravity', 'harmony', 'heritage', 'hypothesis', 'illusion', 'impulse', 'inertia', 'infinity', 'insight',
      'instinct', 'integrity', 'interval', 'irony', 'junction', 'labyrinth', 'lament', 'legacy', 'liberty', 'liminal',
      'mandate', 'matrix', 'mechanism', 'metaphor', 'momentum', 'monolith', 'mythology', 'narrative', 'nebula', 'nucleus',
      'obscure', 'omen', 'paradox', 'parallel', 'phantom', 'philosophy', 'pivot', 'plethora', 'prelude', 'principle',
      'protocol', 'quantum', 'quorum', 'radiance', 'relic', 'resonance', 'reverie', 'sanctuary', 'spectacle', 'spectrum',
      'stigma', 'strategy', 'surplus', 'symmetry', 'synthesis', 'threshold', 'trajectory', 'tribute', 'turbulence', 'twilight',
      'umbra', 'undertow', 'utopia', 'vacuum', 'verdant', 'vertex', 'vestige', 'virtue', 'vortex', 'watershed'
    ]
  }
};

export const ANON_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const DATAMUSE_QUERIES = {
  easy: 'https://api.datamuse.com/words?ml=thing&max=100&md=f',
  medium: 'https://api.datamuse.com/words?ml=concept&max=100&md=f',
  hard: 'https://api.datamuse.com/words?ml=abstract+idea&max=100&md=f'
};

export const WORD_FILTERS = {
  easy: (w, freq) => w.length >= 4 && w.length <= 6 && freq > 10,
  medium: (w, freq) => w.length >= 5 && w.length <= 8 && freq > 2 && freq < 40,
  hard: (w, freq) => w.length >= 5 && w.length <= 10 && freq > 0.5 && freq < 15
};
