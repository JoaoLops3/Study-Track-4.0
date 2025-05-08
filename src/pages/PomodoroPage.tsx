import PomodoroTimer from "../components/PomodoroTimer";
import PomodoroInfo from "../components/PomodoroInfo";

export default function PomodoroPage() {
  return (
    <div className="py-8">
      <PomodoroTimer />
      <PomodoroInfo />
    </div>
  );
}
