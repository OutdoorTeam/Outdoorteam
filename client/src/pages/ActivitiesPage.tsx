/**
 * Página de Actividades METs
 * Academia de Hábitos Saludables
 *
 * Permite a los usuarios:
 * - Ver catálogo de 65+ actividades cotidianas
 * - Registrar actividades completadas
 * - Ver historial del día
 * - Calcular Puntos de Vitalidad en tiempo real
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Search, TrendingUp } from 'lucide-react';

// Importar hooks personalizados
import {
  useActivitiesCatalog,
  useActivityCategories,
  useRegisterActivity,
  useTodayActivities,
  useDeleteActivity,
  useCalculateVitalityPoints,
} from '@/hooks/api/use-activities';

// Importar tipos
import type { Activity } from '@shared/types-v2';

const ActivitiesPage: React.FC = () => {
  const { toast } = useToast();

  // Estados locales
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedActivity, setSelectedActivity] = React.useState<Activity | null>(null);
  const [duration, setDuration] = React.useState<number>(30);
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Queries
  const { data: categoriesData } = useActivityCategories();
  const { data: activitiesData, isLoading: loadingActivities } = useActivitiesCatalog(
    selectedCategory,
    searchTerm
  );
  const { data: todayData } = useTodayActivities();

  // Mutations
  const registerActivity = useRegisterActivity();
  const deleteActivity = useDeleteActivity();

  // Calcular PV estimados
  const estimatedPoints = selectedActivity
    ? useCalculateVitalityPoints(selectedActivity.mets, duration)
    : 0;

  // Puntos totales de hoy
  const todayTotalPoints = React.useMemo(() => {
    if (!todayData?.activities) return 0;
    return todayData.activities.reduce((sum, act) => sum + act.vitality_points_earned, 0);
  }, [todayData]);

  // Handler: Registrar actividad
  const handleRegisterActivity = () => {
    if (!selectedActivity) {
      toast({
        title: 'Error',
        description: 'Selecciona una actividad primero',
        variant: 'destructive',
      });
      return;
    }

    if (duration < 1 || duration > 480) {
      toast({
        title: 'Error',
        description: 'La duración debe estar entre 1 y 480 minutos',
        variant: 'destructive',
      });
      return;
    }

    registerActivity.mutate(
      {
        activity_id: selectedActivity.id,
        duration_minutes: duration,
      },
      {
        onSuccess: (data) => {
          toast({
            title: '¡Actividad registrada!',
            description: data.message,
            variant: 'default',
          });

          // Resetear formulario
          setSelectedActivity(null);
          setDuration(30);
        },
        onError: (error) => {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  // Handler: Eliminar actividad
  const handleDeleteActivity = (activityId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return;
    }

    deleteActivity.mutate(activityId, {
      onSuccess: () => {
        toast({
          title: 'Actividad eliminada',
          description: 'La actividad se eliminó correctamente',
          variant: 'default',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  // Filtrar actividades por categoría seleccionada
  const activitiesList = React.useMemo(() => {
    if (!activitiesData) return [];

    if (selectedCategory) {
      return activitiesData.groupedByCategory[selectedCategory] || [];
    }

    return activitiesData.activities || [];
  }, [activitiesData, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D3B869] mb-2">
            📊 Actividades del Día a Día
          </h1>
          <p className="text-gray-400">
            Registra tus actividades cotidianas y gana Puntos de Vitalidad
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel Izquierdo: Formulario de Registro */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869]">Registrar Actividad</CardTitle>
                <CardDescription className="text-gray-400">
                  Selecciona una actividad y la duración
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buscar actividad */}
                <div className="space-y-2">
                  <Label htmlFor="search">Buscar Actividad</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Buscar por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                    />
                  </div>
                </div>

                {/* Filtro por categoría */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas</SelectItem>
                      {categoriesData?.categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de actividades */}
                <div className="space-y-2">
                  <Label>Actividad</Label>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {loadingActivities ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[#D3B869]" />
                      </div>
                    ) : activitiesList.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">
                        No se encontraron actividades
                      </p>
                    ) : (
                      activitiesList.map((activity) => (
                        <button
                          key={activity.id}
                          onClick={() => setSelectedActivity(activity)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedActivity?.id === activity.id
                              ? 'bg-[#D3B869] text-black'
                              : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{activity.icon}</span>
                              <div>
                                <div className="font-medium">{activity.name}</div>
                                <div className="text-sm opacity-75">
                                  {activity.mets} METs • {activity.category}
                                </div>
                              </div>
                            </div>
                            {selectedActivity?.id === activity.id && (
                              <span className="font-bold">✓</span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Duración */}
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="480"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {/* Cálculo de puntos */}
                {selectedActivity && (
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Puntos de Vitalidad estimados:</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Fórmula: ({selectedActivity.mets} METs × {duration} min) ÷ 2
                        </p>
                      </div>
                      <div className="text-3xl font-bold text-[#D3B869]">
                        {estimatedPoints} PV
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de registro */}
                <Button
                  onClick={handleRegisterActivity}
                  disabled={!selectedActivity || registerActivity.isPending}
                  className="w-full bg-[#D3B869] text-black hover:bg-[#D3B869]/90"
                  size="lg"
                >
                  {registerActivity.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Actividad
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Panel Derecho: Historial y Estadísticas */}
          <div className="space-y-6">
            {/* Estadísticas del día */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869] flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#D3B869] mb-2">
                    {todayTotalPoints} PV
                  </p>
                  <p className="text-sm text-gray-400">
                    {todayData?.activities.length || 0} actividades registradas
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Historial del día */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869]">Historial de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {todayData?.activities && todayData.activities.length > 0 ? (
                    todayData.activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="bg-gray-700 p-3 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-white">{activity.activity_name}</p>
                          <p className="text-sm text-gray-400">
                            {activity.duration_minutes} min • {activity.mets_value} METs
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[#D3B869] font-bold">
                            +{activity.vitality_points_earned} PV
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity.id)}
                            disabled={deleteActivity.isPending}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No hay actividades registradas hoy
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
