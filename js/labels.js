export const PRESETS = [
  { name: 'Kiss / Marry / Kill', labels: ['Kiss', 'Marry', 'Kill'] },
  { name: 'Smash / Marry / Pass', labels: ['Smash', 'Marry', 'Pass'] },
  { name: 'Date / Friendzone / Ghost', labels: ['Date', 'Friendzone', 'Ghost'] },
  { name: 'Hire / Fire / Promote', labels: ['Hire', 'Fire', 'Promote'] },
];

export function validateCustomLabels(a, b, c) {
  const labels = [a, b, c].map((s) => (s ?? '').trim());
  if (labels.some((label) => label.length === 0)) {
    return null;
  }
  return labels;
}

export function createPinState() {
  return { armed: null, pins: {} };
}

export function clickChip(state, label) {
  if (state.armed === label) {
    return { ...state, armed: null };
  }
  const alreadyUsed = Object.values(state.pins).includes(label);
  if (alreadyUsed) {
    return state;
  }
  return { ...state, armed: label };
}

export function clickCard(state, cardIndex) {
  if (Object.prototype.hasOwnProperty.call(state.pins, cardIndex)) {
    const rest = { ...state.pins };
    delete rest[cardIndex];
    return { ...state, pins: rest };
  }
  if (!state.armed) {
    return state;
  }
  return {
    armed: null,
    pins: { ...state.pins, [cardIndex]: state.armed },
  };
}
