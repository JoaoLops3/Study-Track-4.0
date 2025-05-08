import PomodoroTimer from "../components/PomodoroTimer";

export default function Pomodoro() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Timer Pomodoro</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Mantenha o foco e seja produtivo com sessões cronometradas de trabalho
        </p>
      </header>

      <PomodoroTimer />

      <div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Sobre a Técnica Pomodoro</h2>
        <div className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            A Técnica Pomodoro é um método de gerenciamento de tempo
            desenvolvido por Francesco Cirillo no final dos anos 1980. Ela
            utiliza um timer para dividir o trabalho em intervalos,
            tradicionalmente de 25 minutos, separados por pequenas pausas.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Escolha a tarefa que será realizada</li>
            <li>Defina o timer para 25 minutos (um “Pomodoro”)</li>
            <li>Trabalhe na tarefa até o timer tocar</li>
            <li>Faça uma pausa curta (5 minutos)</li>
            <li>Após quatro Pomodoros, faça uma pausa longa (15-30 minutos)</li>
          </ol>
          <p>
            Essa técnica ajuda a melhorar o foco ao criar um senso de urgência e
            previne o esgotamento ao incluir pausas regulares. Também auxilia no
            acompanhamento da produtividade e na estimativa do tempo necessário
            para cada tarefa.
          </p>
        </div>
      </div>
    </div>
  );
}
