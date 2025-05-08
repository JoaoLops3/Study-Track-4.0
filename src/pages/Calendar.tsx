import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { toast } from "react-hot-toast";
import EventForm from "../components/calendar/EventForm";
import GoogleCalendarButton from "../components/calendar/GoogleCalendarButton";

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  user_id: string;
  source?: "local" | "google";
}

export default function Calendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGoogleIntegration, setHasGoogleIntegration] = useState(false);

  // Função para buscar eventos do mês atual
  const fetchEvents = async () => {
    if (!user) return;

    try {
      // Ajustar as datas para o fuso horário local
      const startOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
      );
      endOfMonth.setHours(23, 59, 59, 999);

      console.log("Buscando eventos entre:", {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      });

      // Buscar eventos locais
      const { data: localEvents, error: localError } = await supabase
        .from("events")
        .select("*")
        .gte("start_date", startOfMonth.toISOString())
        .lte("end_date", endOfMonth.toISOString())
        .order("start_date");

      if (localError) throw localError;

      // Processar eventos locais
      const processedLocalEvents = (localEvents || []).map((event) => {
        const startDate = new Date(event.start_date);
        const endDate = new Date(event.end_date);

        // Ajustar para o fuso horário local
        const localStartDate = new Date(
          startDate.getTime() - startDate.getTimezoneOffset() * 60000
        );
        const localEndDate = new Date(
          endDate.getTime() - endDate.getTimezoneOffset() * 60000
        );

        return {
          ...event,
          start_date: localStartDate.toISOString(),
          end_date: localEndDate.toISOString(),
          source: "local" as const,
        };
      });

      // Buscar eventos do Google Calendar
      const { data: googleIntegration } = await supabase
        .from("google_calendar_integrations")
        .select("*")
        .eq("user_id", user.id)
        .single();

      setHasGoogleIntegration(!!googleIntegration);

      let googleEvents: Event[] = [];
      if (googleIntegration) {
        try {
          // Primeiro, buscar a lista de calendários do usuário
          const calendarListResponse = await fetch(
            "https://www.googleapis.com/calendar/v3/users/me/calendarList",
            {
              headers: {
                Authorization: `Bearer ${googleIntegration.access_token}`,
              },
            }
          );

          if (!calendarListResponse.ok) {
            throw new Error("Erro ao buscar lista de calendários");
          }

          const calendarList = await calendarListResponse.json();
          console.log("Calendários encontrados:", calendarList.items);

          // Buscar eventos de cada calendário
          for (const calendar of calendarList.items) {
            try {
              const response = await fetch(
                `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
                  calendar.id
                )}/events?` +
                  new URLSearchParams({
                    timeMin: startOfMonth.toISOString(),
                    timeMax: endOfMonth.toISOString(),
                    singleEvents: "true",
                    orderBy: "startTime",
                  }),
                {
                  headers: {
                    Authorization: `Bearer ${googleIntegration.access_token}`,
                  },
                }
              );

              if (!response.ok) {
                // Se o token expirou, tentar atualizar
                if (response.status === 401) {
                  const tokenResponse = await fetch(
                    "https://oauth2.googleapis.com/token",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                      body: new URLSearchParams({
                        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                        client_secret: import.meta.env
                          .VITE_GOOGLE_CLIENT_SECRET,
                        refresh_token: googleIntegration.refresh_token,
                        grant_type: "refresh_token",
                      }),
                    }
                  );

                  if (tokenResponse.ok) {
                    const tokens = await tokenResponse.json();
                    await supabase
                      .from("google_calendar_integrations")
                      .update({
                        access_token: tokens.access_token,
                        token_expires_at: new Date(
                          Date.now() + tokens.expires_in * 1000
                        ).toISOString(),
                      })
                      .eq("id", googleIntegration.id);

                    // Tentar buscar eventos novamente com o novo token
                    const newResponse = await fetch(
                      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
                        calendar.id
                      )}/events?` +
                        new URLSearchParams({
                          timeMin: startOfMonth.toISOString(),
                          timeMax: endOfMonth.toISOString(),
                          singleEvents: "true",
                          orderBy: "startTime",
                        }),
                      {
                        headers: {
                          Authorization: `Bearer ${tokens.access_token}`,
                        },
                      }
                    );

                    if (newResponse.ok) {
                      const data = await newResponse.json();
                      const calendarEvents = data.items.map((event: any) => {
                        // Tratar eventos de dia inteiro
                        const isAllDay = !event.start.dateTime;
                        let startDate: Date;
                        let endDate: Date;

                        if (isAllDay) {
                          // Para eventos de dia inteiro, usar a data como está
                          startDate = new Date(event.start.date);
                          endDate = new Date(event.end.date);
                          // Subtrair um dia da data final pois o Google Calendar usa data exclusiva
                          endDate.setDate(endDate.getDate() - 1);
                        } else {
                          startDate = new Date(event.start.dateTime);
                          endDate = new Date(event.end.dateTime);
                        }

                        // Ajustar para o fuso horário local
                        const localStartDate = new Date(
                          startDate.getTime() -
                            startDate.getTimezoneOffset() * 60000
                        );
                        const localEndDate = new Date(
                          endDate.getTime() -
                            endDate.getTimezoneOffset() * 60000
                        );

                        console.log("Processando evento:", {
                          title: event.summary,
                          originalStart: event.start,
                          processedStart: localStartDate,
                          isAllDay,
                        });

                        return {
                          id: event.id,
                          title: event.summary,
                          description: event.description || "",
                          start_date: localStartDate.toISOString(),
                          end_date: localEndDate.toISOString(),
                          color: event.colorId
                            ? `#${event.colorId}`
                            : calendar.backgroundColor || "#3b82f6",
                          user_id: user.id,
                          source: "google" as const,
                        };
                      });
                      googleEvents = [...googleEvents, ...calendarEvents];
                    }
                  }
                }
              } else {
                const data = await response.json();
                const calendarEvents = data.items.map((event: any) => {
                  // Tratar eventos de dia inteiro
                  const isAllDay = !event.start.dateTime;
                  let startDate: Date;
                  let endDate: Date;

                  if (isAllDay) {
                    // Para eventos de dia inteiro, usar a data como está
                    startDate = new Date(event.start.date);
                    endDate = new Date(event.end.date);
                    // Subtrair um dia da data final pois o Google Calendar usa data exclusiva
                    endDate.setDate(endDate.getDate() - 1);
                  } else {
                    startDate = new Date(event.start.dateTime);
                    endDate = new Date(event.end.dateTime);
                  }

                  // Ajustar para o fuso horário local
                  const localStartDate = new Date(
                    startDate.getTime() - startDate.getTimezoneOffset() * 60000
                  );
                  const localEndDate = new Date(
                    endDate.getTime() - endDate.getTimezoneOffset() * 60000
                  );

                  console.log("Processando evento:", {
                    title: event.summary,
                    originalStart: event.start,
                    processedStart: localStartDate,
                    isAllDay,
                  });

                  return {
                    id: event.id,
                    title: event.summary,
                    description: event.description || "",
                    start_date: localStartDate.toISOString(),
                    end_date: localEndDate.toISOString(),
                    color: event.colorId
                      ? `#${event.colorId}`
                      : calendar.backgroundColor || "#3b82f6",
                    user_id: user.id,
                    source: "google" as const,
                  };
                });
                googleEvents = [...googleEvents, ...calendarEvents];
              }
            } catch (error) {
              console.error(
                `Erro ao buscar eventos do calendário ${calendar.summary}:`,
                error
              );
            }
          }
        } catch (error) {
          console.error("Erro ao buscar eventos do Google Calendar:", error);
        }
      }

      // Combinar eventos locais e do Google
      const allEvents = [...processedLocalEvents, ...googleEvents];
      console.log("Eventos carregados:", allEvents);

      setEvents(allEvents);
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast.error("Erro ao carregar eventos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, user]);

  // Funções de navegação do calendário
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  // Função para gerar os dias do mês
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Adicionar dias vazios para alinhar com o primeiro dia do mês
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Adicionar os dias do mês
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Função para verificar se um dia tem eventos
  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter((event) => {
      const eventDate = new Date(event.start_date);
      // Ajustar para o fuso horário local
      const localEventDate = new Date(
        eventDate.getTime() - eventDate.getTimezoneOffset() * 60000
      );
      return (
        localEventDate.getDate() === date.getDate() &&
        localEventDate.getMonth() === date.getMonth() &&
        localEventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  // Função para formatar a data
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Função para deletar evento
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      if (event.source === "google") {
        toast.error("Não é possível deletar eventos do Google Calendar");
        return;
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
      toast.success("Evento deletado com sucesso!");
      fetchEvents();
    } catch (error: any) {
      console.error("Erro ao deletar evento:", error);
      toast.error(error.message || "Erro ao deletar evento");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho do Calendário */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Calendário</h1>
          <div className="flex flex-wrap items-center gap-4">
            <GoogleCalendarButton />
            <button
              onClick={() => {
                setSelectedEvent(null);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus size={20} />
              Novo Evento
            </button>
          </div>
        </div>

        {/* Navegação do Mês */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-2xl font-semibold capitalize">
            {formatDate(currentDate)}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Grade do Calendário */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-medium text-gray-600 dark:text-gray-300"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Dias do mês */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
            {getDaysInMonth().map((date, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 bg-white dark:bg-gray-800 ${
                  date && date.getMonth() === currentDate.getMonth()
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {date && (
                  <>
                    <div className="font-medium mb-1">{date.getDate()}</div>
                    <div className="space-y-1">
                      {getEventsForDay(date).map((event) => (
                        <div key={event.id} className="group relative">
                          <div
                            onClick={() => {
                              if (event.source === "local") {
                                setSelectedEvent(event);
                                setIsModalOpen(true);
                              }
                            }}
                            className={`text-xs p-1 rounded cursor-pointer truncate hover:opacity-80 transition-opacity ${
                              event.source === "google"
                                ? "cursor-default"
                                : "cursor-pointer"
                            }`}
                            style={{ backgroundColor: event.color + "20" }}
                          >
                            {event.title}
                          </div>
                          {event.source === "local" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    "Tem certeza que deseja deletar este evento?"
                                  )
                                ) {
                                  handleDeleteEvent(event.id);
                                }
                              }}
                              className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-500"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Evento */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <EventForm
              event={selectedEvent}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
              }}
              onSave={() => {
                setIsModalOpen(false);
                setSelectedEvent(null);
                fetchEvents();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
