import { differenceInSeconds } from "date-fns";
import {
  createContext,
  ReactNode,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  pauseCurrentCycleAction,
  addNewCycleAction,
  interruptCurrentCycleAction,
  markCurrentCycleAsFinishedAction,
} from "../reducers/cycles/actions";
import { Cycle, cyclesReducer } from "../reducers/cycles/reducer";

interface CreateCycleData {
  task: string;
  minutesAmount: number;
}
interface CyclesContextProviderProps {
  children: ReactNode;
}

interface CyclesContextType {
  cycles: Cycle[];
  amountSecondsPassed: number;
  activeCycleId: string | null | {};
  activeCycle: Cycle | undefined | null;

  pauseCurrentCycle: () => void;
  interruptCurrentCycle: () => void;
  markCurrentCycleAsFinished: () => void;
  setSecondsPassed: (seconds: number) => void;
  createNewCycle: (data: CreateCycleData) => void;
}

export const CyclesContext = createContext({} as CyclesContextType);

export function CyclesContextProvider({
  children,
}: CyclesContextProviderProps) {
  const [cyclesState, dispatch] = useReducer(
    cyclesReducer,
    {
      cycles: [],
      activeCycleId: null,
    },
    () => {
      const storedStateAsJSON = localStorage.getItem(
        "@pomodoro-timer:cycles-state-1.0.0"
      );
      if (storedStateAsJSON) {
        return JSON.parse(storedStateAsJSON);
      }
      return { cycles: [], activeCycleId: null };
    }
  );

  const { cycles, activeCycleId } = cyclesState;
  const activeCycle = cycles.find((cycle) => cycle.id === activeCycleId);

  useEffect(() => {
    const stateJSOn = JSON.stringify(cyclesState);
    localStorage.setItem("@pomodoro-timer:cycles-state-1.0.0", stateJSOn);
  }, [cyclesState]);
  const [amountSecondsPassed, setAmountSecondsPassed] = useState(() => {
    if (activeCycle) {
      return differenceInSeconds(new Date(), new Date(activeCycle.startDate));
    }

    return 0;
  });

  function markCurrentCycleAsFinished() {
    dispatch(markCurrentCycleAsFinishedAction);
  }
  function setSecondsPassed(seconds: number) {
    setAmountSecondsPassed(seconds);
  }
  function createNewCycle(data: CreateCycleData) {
    const id = String(new Date().getTime());
    const newCycle: Cycle = {
      id,
      task: data.task,
      minutesAmount: data.minutesAmount,
      startDate: new Date(),
    };
    dispatch(addNewCycleAction(newCycle));

    setAmountSecondsPassed(0);
  }

  function interruptCurrentCycle() {
    dispatch(interruptCurrentCycleAction());
    document.title = "Pomodoro Timer";
  }

  function pauseCurrentCycle() {
    dispatch(pauseCurrentCycleAction());
    document.title = "Pomodoro Timer";
  }

  return (
    <CyclesContext.Provider
      value={{
        activeCycle,
        activeCycleId,
        createNewCycle,
        setSecondsPassed,
        pauseCurrentCycle,
        amountSecondsPassed,
        interruptCurrentCycle,
        markCurrentCycleAsFinished,
        cycles,
      }}
    >
      {children}
    </CyclesContext.Provider>
  );
}
