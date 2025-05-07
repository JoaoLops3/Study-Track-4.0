import PomodoroTimer from '../components/PomodoroTimer';

export default function Pomodoro() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Pomodoro Timer</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Stay focused and productive with timed work sessions
        </p>
      </header>
      
      <PomodoroTimer />
      
      <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About the Pomodoro Technique</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. It uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Decide on the task to be done</li>
            <li>Set the timer to 25 minutes (a "Pomodoro")</li>
            <li>Work on the task until the timer rings</li>
            <li>Take a short break (5 minutes)</li>
            <li>After four Pomodoros, take a longer break (15-30 minutes)</li>
          </ol>
          <p>
            This technique helps improve focus by creating a sense of urgency and preventing burnout by including regular breaks. It also helps track your productivity and improves your estimation of how long tasks take.
          </p>
        </div>
      </div>
    </div>
  );
}