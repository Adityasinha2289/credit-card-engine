import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { SavingsGoal } from '../types';
import { DEMO_GOALS } from '../data/demo/demoOtherData';

interface MoneyState {
  goals: SavingsGoal[];
}

interface MoneyActions {
  addGoal: (goal: SavingsGoal) => void;
}

export const useMoneyStore = create<MoneyState & MoneyActions>()(
  devtools(
    immer((set, get) => ({
      goals: DEMO_GOALS,
      
      addGoal: (goal: SavingsGoal) => set(state => {
        state.goals.push(goal);
      }),
    })),
    { name: 'moneyStore' }
  )
);
