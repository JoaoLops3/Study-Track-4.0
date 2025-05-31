import { create } from 'zustand';
import { AppState } from '../types';
import { generateWeeklyData } from '../data/weeklyData';
import { getCurrentLevel } from '../data/achievements';
import { supabase } from '../lib/supabase';

const useStore = create<AppState>((set, get) => ({
  currentLevel: 1,
  totalMinutesStudied: 0,
  weeklyProgress: generateWeeklyData(),
  isTimerRunning: false,
  timerMinutes: 25,
  timerSeconds: 0,
  isLoading: false,
  error: null,

  startTimer: () => {
    set({ isTimerRunning: true });
    
    const timer = setInterval(() => {
      const { timerMinutes, timerSeconds, isTimerRunning } = get();
      
      if (!isTimerRunning) {
        clearInterval(timer);
        return;
      }
      
      if (timerMinutes === 0 && timerSeconds === 0) {
        clearInterval(timer);
        set({ isTimerRunning: false });
        get().completeStudySession(get().timerMinutes);
        return;
      }
      
      if (timerSeconds === 0) {
        set({ timerMinutes: timerMinutes - 1, timerSeconds: 59 });
      } else {
        set({ timerSeconds: timerSeconds - 1 });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  },
  
  stopTimer: () => {
    set({ isTimerRunning: false });
  },
  
  resetTimer: () => {
    set({ 
      isTimerRunning: false,
      timerMinutes: 25,
      timerSeconds: 0
    });
  },

  loadUserData: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Carrega o total de minutos estudados
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('minutes_studied')
        .eq('user_id', user.id);

      const totalMinutes = sessions?.reduce((acc, session) => acc + session.minutes_studied, 0) || 0;
      
      set({ 
        totalMinutesStudied: totalMinutes,
        currentLevel: getCurrentLevel(totalMinutes),
        isLoading: false
      });

      // Carrega o progresso semanal após carregar os dados do usuário
      await get().loadProgress();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      set({ error: 'Erro ao carregar dados do usuário', isLoading: false });
    }
  },

  loadProgress: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Calcula o início da semana (Segunda-feira)
      const today = new Date();
      const day = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
      monday.setHours(0, 0, 0, 0);

      // Carrega o progresso semanal
      const { data: weeklyData } = await supabase
        .from('weekly_progress')
        .select('date, minutes_studied')
        .eq('user_id', user.id)
        .gte('date', monday.toISOString().split('T')[0]);

      // Atualiza o progresso semanal
      const updatedProgress = get().weeklyProgress.map(day => {
        const progress = weeklyData?.find(p => p.date === day.date);
        return {
          ...day,
          minutesStudied: progress?.minutes_studied || 0,
          isCompleted: progress?.minutes_studied > 0
        };
      });

      set({ weeklyProgress: updatedProgress, isLoading: false });
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
      set({ error: 'Erro ao carregar progresso', isLoading: false });
    }
  },

  updateProgress: async (minutes: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('Usuário não autenticado');
        set({ isLoading: false });
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      console.log('Atualizando progresso para:', { userId: user.id, date: today, minutes });

      // Primeiro, tenta criar um registro se não existir
      const { error: upsertError } = await supabase
        .from('weekly_progress')
        .upsert({
          user_id: user.id,
          date: today,
          minutes_studied: minutes
        }, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('Erro ao upsert progresso:', upsertError);
        throw upsertError;
      }

      // Depois, busca o registro atualizado
      const { data: currentProgress, error: selectError } = await supabase
        .from('weekly_progress')
        .select('minutes_studied')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      if (selectError) {
        console.error('Erro ao buscar progresso atualizado:', selectError);
        throw selectError;
      }

      // Atualiza o estado local
      const updatedProgress = get().weeklyProgress.map(day => {
        if (day.isToday) {
          return {
            ...day,
            minutesStudied: currentProgress.minutes_studied,
            isCompleted: currentProgress.minutes_studied > 0
          };
        }
        return day;
      });

      set({ weeklyProgress: updatedProgress, isLoading: false });
      console.log('Progresso atualizado com sucesso:', currentProgress);
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      set({ error: 'Erro ao atualizar progresso', isLoading: false });
    }
  },
  
  completeStudySession: async (minutes: number) => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Usa a função RPC para criar/obter a matéria padrão
      const { data: subjectId, error: subjectError } = await supabase
        .rpc('create_default_subject');

      if (subjectError) {
        throw new Error('Erro ao configurar matéria padrão');
      }

      // Salva a sessão de estudo
      const { error: sessionError } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          subject_id: subjectId,
          minutes_studied: minutes,
          completed_at: new Date().toISOString()
        });

      if (sessionError) throw sessionError;

      // Atualiza o progresso semanal
      await get().updateProgress(minutes);

      // Atualiza o total de minutos estudados e o nível
      const newTotalMinutes = get().totalMinutesStudied + minutes;
      const newLevel = getCurrentLevel(newTotalMinutes);

      set({
        totalMinutesStudied: newTotalMinutes,
        currentLevel: newLevel,
        isLoading: false
      });

      // Recarrega o progresso semanal para garantir que está atualizado
      await get().loadProgress();
    } catch (error) {
      console.error('Erro ao completar sessão:', error);
      set({ error: 'Erro ao completar sessão', isLoading: false });
    }
  },
  
  setTimerDuration: (minutes: number) => {
    set({ 
      timerMinutes: minutes,
      timerSeconds: 0,
      isTimerRunning: false
    });
  },

  resetProgress: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Reseta as sessões de estudo
      await supabase
        .from('study_sessions')
        .delete()
        .eq('user_id', user.id);

      // Reseta o progresso semanal
      await supabase
        .from('weekly_progress')
        .delete()
        .eq('user_id', user.id);

      // Reseta o estado local
      set({
        totalMinutesStudied: 0,
        currentLevel: 1,
        weeklyProgress: generateWeeklyData(),
        isLoading: false
      });
    } catch (error) {
      console.error('Erro ao resetar progresso:', error);
      set({ error: 'Erro ao resetar progresso', isLoading: false });
    }
  },

  // Função para verificar a estrutura das tabelas
  checkTables: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        return false;
      }

      // Verificar estrutura da tabela study_sessions
      const { data: studySessionsStructure, error: studySessionsError } = await supabase
        .from('study_sessions')
        .select('id, user_id, minutes_studied, completed_at')
        .limit(1);

      if (studySessionsError) {
        console.error('Erro ao verificar estrutura de study_sessions:', studySessionsError);
        return false;
      }

      // Verificar estrutura da tabela weekly_progress
      const { data: weeklyProgressStructure, error: weeklyProgressError } = await supabase
        .from('weekly_progress')
        .select('id, user_id, date, minutes_studied')
        .limit(1);

      if (weeklyProgressError) {
        console.error('Erro ao verificar estrutura de weekly_progress:', weeklyProgressError);
        return false;
      }

      console.log('Estrutura de study_sessions:', studySessionsStructure);
      console.log('Estrutura de weekly_progress:', weeklyProgressStructure);

      return true;
    } catch (error) {
      console.error('Erro ao verificar tabelas:', error);
      return false;
    }
  }
}));

export default useStore; 