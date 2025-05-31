import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { pomodoroAchievements, PomodoroAchievement } from '../data/pomodoroAchievements';
import { toast } from 'react-hot-toast';

interface UserPomodoroAchievement {
  id?: string; // Supabase ID
  user_id: string;
  achievement_id: string; // ID da conquista (ex: 'pomodoro-1')
  progress: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export const usePomodoroAchievements = () => {
  const { user } = useAuth();
  const [userAchievements, setUserAchievements] = useState<UserPomodoroAchievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mapeia o progresso do usuário por achievement_id para acesso rápido
  const userProgressMap = userAchievements.reduce((acc, ua) => {
    acc[ua.achievement_id] = ua;
    return acc;
  }, {} as Record<string, UserPomodoroAchievement>);

  useEffect(() => {
    if (user) {
      fetchUserAchievements();
    } else {
      setUserAchievements([]);
      setIsLoading(false);
    }
  }, [user]);

  // Busca o progresso atual do usuário no Supabase
  const fetchUserAchievements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('user_pomodoro_achievements')
      .select('*')
      .eq('user_id', user!.id);

    if (error) {
      console.error('Erro ao buscar conquistas do Pomodoro:', error);
      // toast.error('Erro ao carregar conquistas do Pomodoro'); // Evitar toast excessivo ao carregar
    } else {
      // Inicializar conquistas que o usuário ainda não tem no DB com progresso 0
      const initialAchievements = pomodoroAchievements.map(pa => {
        const existing = data.find(d => d.achievement_id === pa.id);
        return existing || {
          user_id: user!.id,
          achievement_id: pa.id,
          progress: 0,
          unlocked: false,
        };
      });
      setUserAchievements(initialAchievements);
    }
    setIsLoading(false);
  };

  // Atualiza o progresso de uma conquista específica
  const updateAchievementProgress = async (achievementId: string, amount: number) => {
    if (!user) return;

    const achievement = pomodoroAchievements.find(pa => pa.id === achievementId);
    if (!achievement) {
      console.error(`Conquista com ID ${achievementId} não encontrada.`);
      return;
    }

    // Encontrar o progresso atual do usuário para esta conquista
    const currentUserAchievement = userProgressMap[achievementId];

    if (!currentUserAchievement) {
         console.error(`Progresso do usuário para a conquista ${achievementId} não encontrado.`);
         // Se não encontrar, criar uma entrada inicial antes de atualizar
         const newAchievementProgress: UserPomodoroAchievement = {
            user_id: user.id,
            achievement_id: achievementId,
            progress: amount, // Assume que o 'amount' é o novo total para este critério
            unlocked: false,
         };
         const { data, error } = await supabase
            .from('user_pomodoro_achievements')
            .insert([newAchievementProgress]).select().single();

         if (error) {
            console.error('Erro ao inserir progresso inicial da conquista:', error);
            toast.error('Erro ao salvar progresso da conquista');
         } else {
            setUserAchievements(prev => [...prev.filter(ua => ua.achievement_id !== achievementId), data]);
            checkAndUnlockAchievements([data]); // Verificar se desbloqueou com essa nova entrada
         }

    } else if (!currentUserAchievement.unlocked) {
      // Se a conquista não foi desbloqueada, atualizar o progresso
      const newProgress = currentUserAchievement.progress + amount;

      const { data, error } = await supabase
        .from('user_pomodoro_achievements')
        .update({ progress: newProgress })
        .eq('id', currentUserAchievement.id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar progresso da conquista:', error);
        toast.error('Erro ao salvar progresso da conquista');
      } else {
        setUserAchievements(prev => prev.map(ua => ua.id === data.id ? data : ua));
        checkAndUnlockAchievements([data]); // Verificar se desbloqueou com a atualização
      }
    }
  };

    // Verifica se alguma conquista foi desbloqueada com o progresso atual
    const checkAndUnlockAchievements = async (updatedAchievements: UserPomodoroAchievement[]) => {
        if (!user) return;

        const unlockedNow: UserPomodoroAchievement[] = [];

        for (const userAchievement of updatedAchievements) {
             const achievement = pomodoroAchievements.find(pa => pa.id === userAchievement.achievement_id);

             if (achievement && !userAchievement.unlocked && userAchievement.progress >= achievement.requiredAmount) {
                // Desbloquear conquista
                 const { data, error } = await supabase
                    .from('user_pomodoro_achievements')
                    .update({ unlocked: true, unlocked_at: new Date().toISOString() })
                    .eq('id', userAchievement.id)
                    .select()
                    .single();

                if (error) {
                    console.error('Erro ao desbloquear conquista:', error);
                    toast.error('Erro ao desbloquear conquista');
                } else if (data) {
                    unlockedNow.push(data);
                    toast.success(`Conquista Desbloqueada: ${achievement.name}!`);
                }
             }
        }

        if(unlockedNow.length > 0) {
            // Atualizar estado local com conquistas desbloqueadas
            setUserAchievements(prev =>
                prev.map(ua => {
                    const unlocked = unlockedNow.find(un => un.id === ua.id);
                    return unlocked || ua;
                })
            );
        }
    };

    // Função específica para chamar quando uma sessão Pomodoro completa
    const handlePomodoroComplete = async (minutes: number) => {
         if (!user) return;

         // Encontrar todas as conquistas baseadas em 'sessionsCompleted'
         const sessionAchievements = pomodoroAchievements.filter(pa => pa.criteriaType === 'sessionsCompleted');

         // Atualizar o progresso para cada uma dessas conquistas
         const updates = sessionAchievements.map(async sa => {
            const currentUserAchievement = userProgressMap[sa.id];
            if (!currentUserAchievement || !currentUserAchievement.unlocked) {
                 // Buscar a entrada no DB para garantir que estamos atualizando o estado mais recente
                 const { data, error } = await supabase
                    .from('user_pomodoro_achievements')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('achievement_id', sa.id)
                    .single();

                 if (error && error.code !== 'PGRST116') { // PGRST116 = Nenhum dado retornado (ok se for a primeira sessão)
                     console.error('Erro ao buscar conquista individual para atualização:', error);
                     return null; // Ignorar este erro e continuar
                 }
                 const currentProgress = data ? data.progress : 0;

                 // Se a conquista não está desbloqueada, incrementar e tentar salvar
                 if (!data || !data.unlocked) {
                     const newProgress = currentProgress + 1;
                     const upsertData = {
                         user_id: user.id,
                         achievement_id: sa.id,
                         progress: newProgress,
                         unlocked: false, // Ainda não desbloqueado (verificado depois)
                         // id será gerado automaticamente no insert, ou usado no update
                         ...(data && { id: data.id }) // Incluir ID se a entrada já existe para fazer upsert
                     };

                     const { data: upsertResult, error: upsertError } = await supabase
                         .from('user_pomodoro_achievements')
                         .upsert([upsertData], { onConflict: 'user_id, achievement_id' }).select().single(); // Usar onConflict para inserir ou atualizar

                     if (upsertError) {
                         console.error(`Erro ao upsert progresso da conquista ${sa.id}:`, upsertError);
                         return null;
                     }
                     return upsertResult;
                 }
                 return data; // Retorna os dados existentes se já desbloqueado
            }
             return currentUserAchievement; // Retorna o estado local se já buscado e desbloqueado
         });

         // Aguardar todas as atualizações de sessão
         const results = (await Promise.all(updates)).filter(result => result !== null) as UserPomodoroAchievement[];

         // Atualizar o estado local com os resultados
         if(results.length > 0) {
              setUserAchievements(prev => {
                  const nextState = [...prev.filter(ua => !results.find(res => res.achievement_id === ua.achievement_id))];
                   nextState.push(...results);
                   return nextState;
              });
              // Verificar se alguma conquista foi desbloqueada com estas atualizações
              checkAndUnlockAchievements(results);
         }

         // Implementar lógica para outros criteriaTypes (totalMinutesFocused, perfectSessions, consecutiveDays)
         // Isso exigirá rastrear esses valores no estado do Pomodoro ou no Supabase.
         // Por enquanto, focamos em sessionsCompleted.
    };


  return {
    userAchievements,
    isLoading,
    handlePomodoroComplete, // Expor função para chamar ao completar Pomodoro
    // Pode expor outras funções de atualização se necessário
  };
}; 