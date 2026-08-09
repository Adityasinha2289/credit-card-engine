export interface Partner {
  id: string;
  name: string;
  category: string;
}

export const MOCK_PARTNERS: Partner[] = [
  { id: 'part-nike', name: 'Nike', category: 'shopping' },
  { id: 'part-cultfit', name: 'Cult.fit', category: 'fitness' },
  { id: 'part-uber', name: 'Uber', category: 'transport' },
  { id: 'part-olive', name: 'Olive Bar & Kitchen', category: 'dining' },
  { id: 'part-taj', name: 'Taj Hotels', category: 'accommodation' },
  { id: 'part-makemytrip', name: 'MakeMyTrip', category: 'travel' },
];
