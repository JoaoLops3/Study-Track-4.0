// import { Trophy, Timer, Zap, Clock, Leaf, Star } from 'lucide-react'; // Não precisamos mais importar aqui

// Definir um tipo para as conquistas de Pomodoro
export interface PomodoroAchievement {
  id: string;
  name: string;
  description: string; // Usaremos a descrição para o tooltip
  icon: string; // Agora 'icon' será um nome/identificador para a insígnia
  criteriaType: 'sessionsCompleted' | 'totalMinutesFocused' | 'perfectSessions' | 'consecutiveDays'; // Tipos de critérios (ex: sessões completadas)
  requiredAmount: number; // Quantidade necessária para a conquista
}

// Mapeamento de nomes de ícones para componentes Lucide React (APENAS PARA REFERÊNCIA INICIAL, SERÁ SUBSTITUÍDO)
// const ICON_MAP = {
//     trophy: Trophy,
//     timer: Timer,
//     zap: Zap,
//     clock: Clock,
//     leaf: Leaf,
//     star: Star,
// };

// Lista de conquistas baseadas no Pomodoro
export const pomodoroAchievements: PomodoroAchievement[] = [
  {
    id: 'pomodoro-1',
    name: 'Primeira Semente Plantada',
    description: 'Complete sua primeira sessão de Pomodoro.',
    icon: 'insignia-semente', // Usando um nome de insígnia
    criteriaType: 'sessionsCompleted',
    requiredAmount: 1,
  },
  {
    id: 'pomodoro-2',
    name: 'Jardineiro Iniciante',
    description: 'Complete 5 sessões de Pomodoro.',
    icon: 'insignia-folha', // Outro nome
    criteriaType: 'sessionsCompleted',
    requiredAmount: 5,
  },
  {
    id: 'pomodoro-3',
    name: 'Mestre do Foco Curto',
    description: 'Complete 10 sessões de Pomodoro.',
    icon: 'insignia-estrela-1', // Insígnia com 1 estrela
    criteriaType: 'sessionsCompleted',
    requiredAmount: 10,
  },
   {
    id: 'pomodoro-4',
    name: 'Ritmo Constante',
    description: 'Complete 3 dias consecutivos usando o Pomodoro.',
    icon: 'insignia-dias', // Insígnia para dias
    criteriaType: 'consecutiveDays',
    requiredAmount: 3,
  },
  {
    id: 'pomodoro-5',
    name: 'Colecionador de Pomodoros',
    description: 'Complete 30 sessões de Pomodoro.',
    icon: 'insignia-estrela-3', // Insígnia com 3 estrelas
    criteriaType: 'sessionsCompleted',
    requiredAmount: 30,
  },
]; 