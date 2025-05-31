import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import EventForm from "../components/calendar/EventForm";
import GoogleCalendarButton from "../components/calendar/GoogleCalendarButton";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

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

interface GoogleCalendarEvent {
	id: string;
	summary?: string;
	description?: string;
	start: { date?: string; dateTime?: string };
	end: { date?: string; dateTime?: string };
	colorId?: string;
}

interface GoogleCalendarListEntry {
	id: string;
	summary?: string;
	backgroundColor?: string;
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
	const fetchEvents = useCallback(async () => {
		if (!user) {
			setEvents([]);
			setIsLoading(false);
			setHasGoogleIntegration(false);
			return;
		}

		setIsLoading(true);

		try {
			// Ajustar as datas para o início e fim do mês no fuso horário local
			const startOfMonth = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				1,
			);
			startOfMonth.setHours(0, 0, 0, 0);

			const endOfMonth = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth() + 1,
				0,
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
				.eq("user_id", user.id)
				.gte("start_date", startOfMonth.toISOString())
				.lte("end_date", endOfMonth.toISOString())
				.order("start_date");

			if (localError) throw localError;

			const processedLocalEvents: Event[] = (localEvents || []).map(
				(event) => ({
					...event,
					source: "local" as const,
				}),
			);

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
					const calendarListResponse = await fetch(
						"https://www.googleapis.com/calendar/v3/users/me/calendarList",
						{
							headers: {
								Authorization: `Bearer ${googleIntegration.access_token}`,
							},
						},
					);

					if (!calendarListResponse.ok) {
						const errorBody = await calendarListResponse.text();
						console.error(
							"Erro ao buscar lista de calendários:",
							calendarListResponse.status,
							errorBody,
						);
						toast.error(
							"Erro ao carregar calendários do Google. Por favor, reconecte.",
						);
						if (calendarListResponse.status === 401) {
							// Lógica de refresh token aqui se necessário, mas por enquanto apenas erro.
						}
						throw new Error("Erro ao buscar lista de calendários");
					}

					const calendarList = await calendarListResponse.json();
					console.log(
						"Calendários encontrados:",
						calendarList.items as GoogleCalendarListEntry[],
					);

					for (const calendar of calendarList.items as GoogleCalendarListEntry[]) {
						try {
							const response = await fetch(
								`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
									calendar.id as string,
								)}/events?${new URLSearchParams({
									timeMin: startOfMonth.toISOString(),
									timeMax: endOfMonth.toISOString(),
									singleEvents: "true",
									orderBy: "startTime",
								}).toString()}`,
								{
									headers: {
										Authorization: `Bearer ${googleIntegration.access_token}`,
									},
								},
							);

							if (!response.ok) {
								const errorBody = await response.text();
								console.error(
									"Erro ao buscar eventos do Google:",
									response.status,
									errorBody,
								);
								if (response.status === 401) {
									toast.error(
										"Sua conexão com o Google expirou. Tentando atualizar...",
									);
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
										},
									);

									if (tokenResponse.ok) {
										const tokens = await tokenResponse.json();
										await supabase
											.from("google_calendar_integrations")
											.update({
												access_token: tokens.access_token,
												token_expires_at: new Date(
													Date.now() + tokens.expires_in * 1000,
												).toISOString(),
											})
											.eq("id", googleIntegration.id);

										const newResponse = await fetch(
											`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
												calendar.id as string,
											)}/events?${new URLSearchParams({
												timeMin: startOfMonth.toISOString(),
												timeMax: endOfMonth.toISOString(),
												singleEvents: "true",
												orderBy: "startTime",
											}).toString()}`,
											{},
										);

										if (newResponse.ok) {
											const data = await newResponse.json();
											const calendarEvents: Event[] = data.items.map(
												(event: GoogleCalendarEvent) => {
													const startDate = event.start.date
														? new Date(`${event.start.date}T00:00:00Z`)
														: new Date(event.start.dateTime as string);
													const endDate = event.end.date
														? new Date(`${event.end.date}T23:59:59Z`)
														: new Date(event.end.dateTime as string);

													return {
														id: event.id as string,
														title: event.summary || "Sem Título",
														description: event.description || "",
														start_date: startDate.toISOString(),
														end_date: endDate.toISOString(),
														color: event.colorId
															? `#${event.colorId}`
															: calendar.backgroundColor || "#3b82f6",
														user_id: user.id,
														source: "google" as const,
													};
												},
											);
											googleEvents = [...googleEvents, ...calendarEvents];
										} else {
											const newErrorBody = await newResponse.text();
											console.error(
												"Erro ao buscar eventos após refresh:",
												newResponse.status,
												newErrorBody,
											);
											toast.error(
												"Erro ao carregar eventos do Google após atualização de token.",
											);
										}
									} else {
										const tokenErrorBody = await tokenResponse.text();
										console.error(
											"Erro ao atualizar token do Google:",
											tokenResponse.status,
											tokenErrorBody,
										);
										toast.error(
											"Erro ao atualizar sua conexão com o Google. Por favor, reconecte.",
										);
									}
								} else {
									toast.error(
										`Erro ao carregar eventos do calendário ${calendar.summary}.`,
									);
								}
							}

            }catch (calendarFetchError: unknown) {
							console.error(
								`Erro ao buscar eventos do calendário $calendar.summary || "desconhecido":`,
								calendarFetchError,
							);
            }
							toast.error(
								`Erro ao carregar eventos do calendário ${calendar.summary || "desconhecido"}.`,
							);
						} catch (googleFetchError: unknown) {
							console.error(
								"Erro ao buscar dados do Google Calendar:",
								googleFetchError,
							);
							toast.error("Erro ao carregar dados do Google Calendar.");
						}
					}
				} catch (googleFetchError: unknown) {
					console.error(
						"Erro ao buscar dados do Google Calendar:",
						googleFetchError,
					);
					toast.error("Erro ao carregar dados do Google Calendar.");
				}
			}

			// Combinar e desduplicar eventos
			const allEvents = [...processedLocalEvents, googleEvents.flat()].flat(); // Usar flat() para garantir que googleEvents seja um array plano
			const uniqueEvents = allEvents.reduce((acc: Event[], current: Event) => {
				const x = acc.find(
					(item: Event) =>
						item.source === current.source && item.id === current.id,
				);
				if (!x) {
					return acc.concat([current]);
				}
				return acc;
			}, [] as Event[]);

			setEvents(uniqueEvents);
		} catch (error: unknown) {
			console.error("Erro geral ao buscar eventos:", error);
			toast.error("Erro ao carregar eventos.");
			setEvents([]);
		} finally {
			setIsLoading(false);
		}
	}, [
		user,
		currentDate,
		supabase,
		toast,
		setIsLoading,
		setHasGoogleIntegration,
	]); // Dependências ajustadas

	useEffect(() => {
		fetchEvents();
	}, [fetchEvents]); // Dependências ajustadas

	// Função para adicionar ou atualizar um evento
	const handleSaveEvent = useCallback(
		async (
			eventData: Omit<Event, "id" | "user_id" | "source"> & { id?: string },
		) => {
			if (!user) return;
			setIsLoading(true);

			const eventToSave = {
				...eventData,
				user_id: user.id,
				start_date: new Date(eventData.start_date).toISOString(),
				end_date: new Date(eventData.end_date).toISOString(),
			};

			try {
				if (eventToSave.id) {
					// Atualizar evento existente
					const { data, error } = await supabase
						.from("events")
						.update(eventToSave)
						.eq("id", eventToSave.id)
						.select();

					if (error) throw error;
					toast.success("Evento atualizado com sucesso!");
				} else {
					// Adicionar novo evento
					const { data, error } = await supabase
						.from("events")
						.insert([eventToSave])
						.select();

					if (error) throw error;
					toast.success("Evento adicionado com sucesso!");
				}
				fetchEvents(); // Recarregar eventos após salvar
				setIsModalOpen(false);
				setSelectedEvent(null);
			} catch (error: unknown) {
				console.error("Erro ao salvar evento:", error);
				toast.error("Erro ao salvar evento.");
			} finally {
				setIsLoading(false);
			}
		},
		[
			user,
			fetchEvents,
			supabase,
			toast,
			setIsLoading,
			setIsModalOpen,
			setSelectedEvent,
		],
	); // Dependências ajustadas

	// Função para deletar um evento
	const handleDeleteEvent = useCallback(
		async (eventId: string, source: "local" | "google") => {
			if (!user) {
				toast.error("Você precisa estar logado para deletar eventos.");
				return;
			}
			if (source === "google") {
				toast.error(
					"Eventos do Google Calendar devem ser deletados diretamente no Google Calendar.",
				);
				return;
			}
			setIsLoading(true);
			try {
				const event = events.find(
					(e) => e.id === eventId && e.source === source,
				);
				if (!event) {
					toast.error("Evento não encontrado.");
					setIsLoading(false);
					return;
				}

				const { error } = await supabase
					.from("events")
					.delete()
					.eq("id", eventId);

				if (error) throw error;
				toast.success("Evento deletado com sucesso!");
				fetchEvents();
			} catch (error: unknown) {
				console.error("Erro ao deletar evento:", error);
				toast.error("Erro ao deletar evento");
			} finally {
				setIsLoading(false);
			}
		},
		[user, events, supabase, toast, fetchEvents, setIsLoading],
	); // Dependências ajustadas

	const previousMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
		);
	};

	const nextMonth = () => {
		setCurrentDate(
			new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
		);
	};

	const getDaysInMonth = () => {
		const year = currentDate.getFullYear();
		const month = currentDate.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const days = [];

		for (let i = 0; i < firstDay.getDay(); i++) {
			days.push(null);
		}

		for (let i = 1; i <= lastDay.getDate(); i++) {
			days.push(new Date(year, month, i));
		}

		return days;
	};

	const getEventsForDay = useCallback(
		(date: Date | null): Event[] => {
			if (!date) return [];

			const startOfDay = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
			);
			startOfDay.setHours(0, 0, 0, 0);

			const endOfDay = new Date(
				date.getFullYear(),
				date.getMonth(),
				date.getDate(),
				23,
				59,
				59,
				999,
			);

			const startOfUtcDay = new Date(
				Date.UTC(
					startOfDay.getUTCFullYear(),
					startOfDay.getUTCMonth(),
					startOfDay.getUTCDate(),
					0,
					0,
					0,
				),
			);
			const endOfUtcDay = new Date(
				Date.UTC(
					endOfDay.getUTCFullYear(),
					endOfDay.getUTCMonth(),
					endOfDay.getUTCDate(),
					23,
					59,
					59,
					999,
				),
			);

			return events.filter((event) => {
				const eventStartDate = new Date(event.start_date);
				const eventEndDate = new Date(event.end_date);

				return (
					eventStartDate.getTime() <= endOfUtcDay.getTime() &&
					eventEndDate.getTime() >= startOfUtcDay.getTime()
				);
			});
		},
		[events],
	);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("pt-BR", {
			month: "long",
			year: "numeric",
		}).format(date);
	};

	const isToday = (date: Date | null) => {
		if (!date) return false;
		const today = new Date();
		return (
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear()
		);
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
					<h1 className="text-3xl font-bold">Calendário</h1>
					<div className="flex flex-wrap items-center gap-4">
						<GoogleCalendarButton />
						<button
							type="button"
							onClick={() => {
								setSelectedEvent(null);
								setIsModalOpen(true);
							}}
							className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
							aria-label="Novo Evento"
						>
							<Plus size={20} />
							Novo Evento
						</button>
					</div>
				</div>

				<div className="flex items-center justify-between mb-6">
					<button
						type="button"
						onClick={previousMonth}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
						aria-label="Mês anterior"
					>
						<ChevronLeft size={24} />
					</button>
					<h2 className="text-2xl font-semibold capitalize">
						{formatDate(currentDate)}
					</h2>
					<button
						type="button"
						onClick={nextMonth}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
						aria-label="Próximo mês"
					>
						<ChevronRight size={24} />
					</button>
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
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

					<div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
						{getDaysInMonth().map((date, index) => (
							<div
								key={date ? date.toISOString() : `empty-${index}`}
								className={`min-h-[120px] p-2 bg-white dark:bg-gray-800 ${
									date && date.getMonth() === currentDate.getMonth()
										? "text-gray-900 dark:text-gray-100"
										: "text-gray-400 dark:text-gray-600"
								} ${
									date && isToday(date)
										? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 dark:border-blue-400"
										: ""
								} ${date ? "border border-gray-200 dark:border-gray-700" : ""}
                `}
							>
								{date && (
									<>
										<div className="font-medium mb-1">{date.getDate()}</div>
										<div className="space-y-1">
											{getEventsForDay(date).map((event) => (
												<div key={event.id} className="group relative">
													<button
														type="button"
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
														style={{ backgroundColor: `${event.color}20` }}
														title={event.title}
														disabled={event.source === "google"}
													>
														{event.title}
													</button>
													{event.source === "local" && (
														<button
															type="button"
															onClick={(e) => {
																e.stopPropagation();
																if (
																	window.confirm(
																		"Tem certeza que deseja deletar este evento?",
																	)
																) {
																	handleDeleteEvent(event.id, "local");
																}
															}}
															className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-500"
															aria-label={`Deletar evento ${event.title}`}
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

			{isModalOpen && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
					<div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
						<EventForm
							event={selectedEvent}
							onClose={() => {
								setIsModalOpen(false);
								setSelectedEvent(null);
							}}
							onSave={handleSaveEvent}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
