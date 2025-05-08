import React from "react";

export default function PomodoroInfo() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Sobre a Técnica Pomodoro
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6">
          A Técnica Pomodoro é um método de gerenciamento de tempo desenvolvido
          por Francesco Cirillo no final dos anos 1980. Ela utiliza um timer
          para dividir o trabalho em intervalos, tradicionalmente de 25 minutos
          de duração, separados por pequenas pausas.
        </p>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Como usar a técnica:
        </h3>

        <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300 mb-6">
          <li>Escolha a tarefa que você vai realizar</li>
          <li>Configure o timer para 25 minutos (um "Pomodoro")</li>
          <li>Trabalhe na tarefa até o timer tocar</li>
          <li>Faça uma pausa curta de 5 minutos</li>
          <li>
            Após completar quatro Pomodoros, faça uma pausa mais longa (15-30
            minutos)
          </li>
        </ol>

        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          Por que usar a Técnica Pomodoro?
        </h3>

        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 mb-6">
          <li>Aumenta seu foco ao criar um senso de urgência</li>
          <li>Evita o esgotamento mental com pausas regulares</li>
          <li>Permite acompanhar sua produtividade ao longo do dia</li>
          <li>
            Melhora sua capacidade de estimar quanto tempo as tarefas levam
          </li>
          <li>
            Combate a procrastinação ao dividir o trabalho em blocos
            gerenciáveis
          </li>
        </ul>

        <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
          <p className="text-indigo-700 dark:text-indigo-300 text-sm">
            Dica: Use o timer flutuante para manter o controle do seu tempo
            mesmo enquanto navega em outras páginas do aplicativo. Isso ajuda a
            manter o foco mesmo quando você precisa consultar outras
            informações.
          </p>
        </div>
      </div>
    </div>
  );
}
