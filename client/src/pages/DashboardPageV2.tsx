/**
 * Dashboard V2 - Academia de Hábitos Saludables
 * Sistema de Puntos de Vitalidad (PV)
 */

import * as React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Check, Activity, Target, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWeeklyVitality, useTodayVitality, useVitalityCalendar } from "@/hooks/api/use-daily-vitality";
import { useTodayNote, useSaveNote } from "@/hooks/api/use-daily-notes";

const DashboardPageV2: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dailyNote, setDailyNote] = React.useState("");
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const today = new Date().toISOString().split("T")[0];

  // React Query hooks
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklyVitality();
  const { data: todayData, isLoading: todayLoading } = useTodayVitality();
  const { data: calendarData, isLoading: calendarLoading } = useVitalityCalendar(currentMonth);
  const { data: todayNoteData, isLoading: noteLoading } = useTodayNote();

  // Mutations
  const saveNoteMutation = useSaveNote();

  // User goals
  const weeklyGoal = user?.weekly_vitality_goal || 28;

  // Initialize note from query data
  React.useEffect(() => {
    if (todayNoteData && typeof todayNoteData.content === 'string') {
      setDailyNote(todayNoteData.content);
    }
  }, [todayNoteData]);

  const handleSaveNote = async () => {
    if (!dailyNote.trim()) return;

    try {
      await saveNoteMutation.mutateAsync({
        content: dailyNote,
        date: today,
      });

      toast({
        title: "Nota guardada",
        description: "Tu nota del día ha sido guardada exitosamente",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la nota",
        variant: "destructive",
      });
    }
  };

  // Get main activities status
  const getMainActivities = () => {
    return [
      {
        key: "daily_steps" as const,
        name: "Pasos Diarios",
        description: "Caminar 8,000 pasos",
        completed: Boolean(todayData?.steps_goal_reached),
        icon: "🚶",
        points: 2,
      },
      {
        key: "training_block" as const,
        name: "Bloque de Entrenamiento",
        description: "Completar un bloque de 10 min",
        completed: Boolean(todayData?.training_block_completed),
        icon: "💪",
        points: 2,
        link: "/training-blocks",
      },
      {
        key: "active_pause" as const,
        name: "Pausa Activa",
        description: "Realizar actividad METs",
        completed: Boolean(todayData?.active_pause_completed),
        icon: "🧘",
        points: 2,
        link: "/activities",
      },
      {
        key: "meditation" as const,
        name: "Meditación",
        description: "Practicar respiración consciente",
        completed: Boolean(todayData?.meditation_completed),
        icon: "🌬️",
        points: 2,
      },
    ];
  };

  // Calendar helpers
  const generateCalendarDays = () => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayData = calendarData?.find((day: any) => day.date === dateStr);
      const points = dayData?.total_points || 0;
      const isCurrentMonth = currentDate.getMonth() === currentMonth.getMonth();
      const isToday = dateStr === today;

      days.push({
        date: new Date(currentDate),
        dateStr,
        points,
        isCurrentMonth,
        isToday,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];

  const mainActivities = getMainActivities();
  const completedMainCount = mainActivities.filter((a) => a.completed).length;
  const todayPoints = todayData?.total_points || 0;
  const mainPoints = todayData?.main_activities_points || 0;
  const extraPoints = todayData?.extra_activities_points || 0;
  const weeklyPoints = weeklyData?.current_points || 0;
  const weeklyProgress = weeklyData?.percentage || 0;

  const isLoading = weeklyLoading || todayLoading || calendarLoading || noteLoading;

  // Show loading screen only on initial load
  if (isLoading && !todayData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-lg text-white">Cargando tu panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D3B869] mb-2">
            Academia de Hábitos Saludables
          </h1>
          <p className="text-gray-400">Sistema de Puntos de Vitalidad (PV)</p>
        </div>

        {/* Top Section - Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* PV Hoy */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">PV Hoy</div>
                  <div className="text-2xl font-bold text-[#D3B869]">
                    {todayPoints}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {mainPoints} principales + {extraPoints} extras
                  </div>
                </div>
                <Activity className="text-[#D3B869]" size={32} />
              </div>
            </CardContent>
          </Card>

          {/* Actividades Completadas */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    Actividades Principales
                  </div>
                  <div className="text-2xl font-bold text-[#D3B869]">
                    {completedMainCount}/4
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {mainPoints} de 8 PV posibles
                  </div>
                </div>
                <Check className="text-[#D3B869]" size={32} />
              </div>
            </CardContent>
          </Card>

          {/* Esta Semana */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400 mb-1">
                    Esta Semana
                  </div>
                  <div className="text-2xl font-bold text-[#D3B869]">
                    {weeklyPoints} PV
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Meta: {weeklyGoal} PV ({weeklyProgress.toFixed(0)}%)
                  </div>
                </div>
                <Target className="text-[#D3B869]" size={32} />
              </div>
            </CardContent>
          </Card>

          {/* Progreso Semanal */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">Progreso Semanal</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-[#D3B869] h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-400">
                  {weeklyPoints >= weeklyGoal ? (
                    <span className="text-green-400">¡Meta alcanzada! 🎉</span>
                  ) : (
                    <span>Faltan {weeklyGoal - weeklyPoints} PV para la meta</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* 4 Actividades Principales */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869] flex items-center justify-between">
                  <span>Actividades Principales (2 PV cada una)</span>
                  <span className="text-sm text-gray-400">
                    Meta diaria: 8 PV
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mainActivities.map((activity) => (
                    <div
                      key={activity.key}
                      className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-2xl">{activity.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-white">
                            {activity.name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {activity.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#D3B869] font-bold">+{activity.points}</span>
                        {activity.link ? (
                          <Link to={activity.link}>
                            <Button
                              size="sm"
                              variant="outline"
                              className={`border-2 ${
                                activity.completed
                                  ? "bg-[#D3B869] border-[#D3B869] text-black"
                                  : "border-[#D3B869] text-[#D3B869] hover:bg-[#D3B869]/20"
                              }`}
                            >
                              {activity.completed ? "✓ Hecho" : "Registrar"}
                            </Button>
                          </Link>
                        ) : (
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              activity.completed
                                ? "bg-[#D3B869] border-[#D3B869] text-black"
                                : "border-[#D3B869] text-[#D3B869]"
                            }`}
                          >
                            {activity.completed && <Check size={18} />}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Info sobre actividades extra */}
                <div className="mt-6 p-4 bg-gray-700/50 rounded-lg border border-[#D3B869]/30">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div>
                      <div className="font-medium text-white mb-1">
                        ¿Quieres sumar más PV?
                      </div>
                      <p className="text-sm text-gray-400 mb-3">
                        Registra actividades extra como: caminatas, ciclismo, natación, yoga,
                        tareas del hogar, y más. Cada actividad suma PV según su intensidad (METs).
                      </p>
                      <Link to="/activities">
                        <Button
                          size="sm"
                          className="bg-[#D3B869] text-black hover:bg-[#D3B869]/90"
                        >
                          Registrar Actividades Extra
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Desglose Semanal */}
            {weeklyData && weeklyData.daily_breakdown && weeklyData.daily_breakdown.length > 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#D3B869] flex items-center gap-2">
                    <CalendarIcon size={20} />
                    Desglose Semanal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {weeklyData.daily_breakdown.map((day: any) => {
                      const date = new Date(day.date);
                      const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
                      const dateStr = `${dayName} ${date.getDate()}/${date.getMonth() + 1}`;

                      return (
                        <div
                          key={day.date}
                          className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-sm font-medium text-white min-w-[80px]">
                              {dateStr}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-600 rounded-full h-2">
                                <div
                                  className="bg-[#D3B869] h-2 rounded-full"
                                  style={{ width: `${Math.min((day.total_points / 10) * 100, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-400">
                              {day.main_activities_points} + {day.extra_activities_points}
                            </div>
                            <div className="text-lg font-bold text-[#D3B869] min-w-[45px] text-right">
                              {day.total_points} PV
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notas del Día */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869]">Notas del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Escribe tus reflexiones del día, logros, retos, etc..."
                  value={dailyNote}
                  onChange={(e) => setDailyNote(e.target.value)}
                  onBlur={handleSaveNote}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 min-h-[100px]"
                  disabled={saveNoteMutation.isPending}
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={saveNoteMutation.isPending || !dailyNote.trim()}
                  className="bg-[#D3B869] text-black hover:bg-[#D3B869]/90 mt-4"
                >
                  {saveNoteMutation.isPending ? 'Guardando...' : 'Guardar Nota'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Calendar */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#D3B869] flex items-center gap-2">
                    📅 Calendario de PV
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigateMonth(-1)}
                      className="text-[#D3B869] hover:text-white"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-white font-medium min-w-[120px] text-center">
                      {monthNames[currentMonth.getMonth()]}{" "}
                      {currentMonth.getFullYear()}
                    </span>
                    <button
                      onClick={() => navigateMonth(1)}
                      className="text-[#D3B869] hover:text-white"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                    <div
                      key={day}
                      className="text-center text-gray-400 text-sm p-2 font-medium"
                    >
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays().map((day, index) => (
                    <div
                      key={index}
                      className={`
                        text-center p-2 text-sm rounded cursor-pointer transition-colors
                        ${day.isCurrentMonth ? "text-white" : "text-gray-600"}
                        ${day.isToday ? "bg-[#D3B869] text-black font-bold" : ""}
                        ${
                          !day.isToday && day.points >= 10
                            ? "bg-green-600"
                            : !day.isToday && day.points >= 6
                              ? "bg-orange-500"
                              : !day.isToday && day.points >= 3
                                ? "bg-yellow-600"
                                : !day.isToday && day.points > 0
                                  ? "bg-blue-600"
                                  : ""
                        }
                        ${!day.isToday && day.points === 0 ? "hover:bg-gray-700" : ""}
                      `}
                      title={`${day.points} PV`}
                    >
                      {day.date.getDate()}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 text-xs text-gray-400">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-600 rounded"></div>
                      <span>≥10 PV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                      <span>6-9 PV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded"></div>
                      <span>3-5 PV</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-600 rounded"></div>
                      <span>1-2 PV</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageV2;
