import { create } from 'zustand';
import { AppState, OnboardingData, BusinessType, Scenario } from '@/types';

interface AppStore extends AppState {
  // 온보딩 관련
  setOnboarding: (data: OnboardingData) => void;
  completeOnboarding: () => void;
  
  // 시나리오 관련
  createScenario: (scenario: Omit<Scenario, 'id'>) => string;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  deleteScenario: (id: string) => void;
  setActiveScenario: (id: string) => void;
  
  // 비즈니스 타입 관련
  setBusinessType: (type: BusinessType) => void;
  
  // 리셋
  reset: () => void;
}

const initialState: AppState = {
  onboarding: null,
  currentBusinessType: null,
  scenarios: [],
  activeScenarioId: null,
  isOnboardingComplete: false,
};

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,
  
  setOnboarding: (data) => set({ onboarding: data }),
  
  completeOnboarding: () => set({ isOnboardingComplete: true }),
  
  createScenario: (scenario) => {
    const id = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newScenario = { ...scenario, id };
    
    set((state) => ({
      scenarios: [...state.scenarios, newScenario],
      activeScenarioId: id,
    }));
    
    return id;
  },
  
  updateScenario: (id, updates) => set((state) => ({
    scenarios: state.scenarios.map((scenario) =>
      scenario.id === id ? { ...scenario, ...updates } : scenario
    ),
  })),
  
  deleteScenario: (id) => set((state) => ({
    scenarios: state.scenarios.filter((scenario) => scenario.id !== id),
    activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId,
  })),
  
  setActiveScenario: (id) => set({ activeScenarioId: id }),
  
  setBusinessType: (type) => set({ currentBusinessType: type }),
  
  reset: () => set(initialState),
}));
