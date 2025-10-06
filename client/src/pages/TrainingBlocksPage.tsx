/**
 * Página de Bloques de Entrenamiento
 * Academia de Hábitos Saludables
 *
 * Bloques de 10 minutos con diferentes intensidades:
 * - HIIT (3 PV)
 * - Fuerza (2.5 PV)
 * - Aeróbico (2 PV)
 * - Adultos Mayores (1.5 PV)
 * - Estiramientos (1 PV)
 * - Relajación (1 PV)
 */

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Play, CheckCircle2, Loader2, TrendingUp, Award } from 'lucide-react';

// Importar hooks
import {
  useTrainingBlocks,
  useTrainingBlockTypes,
  useCompleteTrainingBlock,
  useTodayTrainingSessions,
  useTrainingStats,
} from '@/hooks/api/use-training-blocks';

// Importar tipos
import type { TrainingBlock, TrainingBlockType } from '@shared/types-v2';
import { TRAINING_BLOCK_TYPES } from '@shared/types-v2';

const TrainingBlocksPage: React.FC = () => {
  const { toast } = useToast();

  // Estados
  const [selectedType, setSelectedType] = React.useState<TrainingBlockType | ''>('');
  const [selectedBlock, setSelectedBlock] = React.useState<TrainingBlock | null>(null);

  // Queries
  const { data: typesData } = useTrainingBlockTypes();
  const { data: blocksData, isLoading } = useTrainingBlocks(
    selectedType || undefined
  );
  const { data: todaySessionsData } = useTodayTrainingSessions();
  const { data: statsData } = useTrainingStats();

  // Mutations
  const completeBlock = useCompleteTrainingBlock();

  // Puntos totales de hoy (sesiones de entrenamiento)
  const todayPoints = React.useMemo(() => {
    if (!todaySessionsData?.sessions) return 0;
    return todaySessionsData.sessions.reduce((sum, s) => sum + s.vitality_points_earned, 0);
  }, [todaySessionsData]);

  // Handler: Completar bloque
  const handleCompleteBlock = (block: TrainingBlock) => {
    completeBlock.mutate(
      { block_id: block.id },
      {
        onSuccess: (data) => {
          toast({
            title: '¡Bloque completado!',
            description: data.message,
            variant: 'default',
          });
          setSelectedBlock(null);
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

  // Obtener icono según tipo
  const getTypeIcon = (type: TrainingBlockType): string => {
    return TRAINING_BLOCK_TYPES[type]?.icon || '💪';
  };

  // Obtener color según intensidad
  const getIntensityColor = (intensity: string): string => {
    switch (intensity) {
      case 'high':
        return 'bg-red-500/20 text-red-400';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'low':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D3B869] mb-2">
            💪 Bloques de Entrenamiento
          </h1>
          <p className="text-gray-400">
            Entrenamientos de 10 minutos para todos los niveles
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel Izquierdo: Bloques */}
          <div className="lg:col-span-3">
            {/* Tabs por tipo de bloque */}
            <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as TrainingBlockType | '')}>
              <TabsList className="bg-gray-800 w-full flex-wrap h-auto">
                <TabsTrigger value="" className="data-[state=active]:bg-[#D3B869] data-[state=active]:text-black">
                  🌟 Todos
                </TabsTrigger>
                {typesData?.types.map((type) => (
                  <TabsTrigger
                    key={type.value}
                    value={type.value}
                    className="data-[state=active]:bg-[#D3B869] data-[state=active]:text-black"
                  >
                    {type.icon} {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={selectedType} className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-[#D3B869]" />
                  </div>
                ) : !blocksData || blocksData.blocks.length === 0 ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="py-12">
                      <p className="text-gray-400 text-center">
                        No hay bloques disponibles para este filtro
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blocksData.blocks.map((block) => (
                      <Card
                        key={block.id}
                        className={`bg-gray-800 border-gray-700 hover:border-[#D3B869] transition-colors ${
                          selectedBlock?.id === block.id ? 'border-[#D3B869]' : ''
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getTypeIcon(block.type)}</span>
                              <div>
                                <CardTitle className="text-white text-lg">
                                  {block.title}
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                  {TRAINING_BLOCK_TYPES[block.type]?.label}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge className="bg-[#D3B869] text-black">
                              {block.vitality_points} PV
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Descripción */}
                          {block.description && (
                            <p className="text-sm text-gray-400">{block.description}</p>
                          )}

                          {/* Detalles */}
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-white border-gray-600">
                              ⏱️ {block.duration_minutes} min
                            </Badge>
                            <Badge
                              variant="outline"
                              className={getIntensityColor(block.intensity)}
                            >
                              Intensidad: {block.intensity}
                            </Badge>
                            <Badge variant="outline" className="text-white border-gray-600">
                              Nivel mín: {block.min_activity_level}
                            </Badge>
                          </div>

                          {/* Botones de acción */}
                          <div className="flex gap-2 pt-2">
                            {block.video_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-gray-600 hover:bg-gray-700"
                                onClick={() => window.open(block.video_url, '_blank')}
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Ver Video
                              </Button>
                            )}
                            <Button
                              size="sm"
                              className="flex-1 bg-[#D3B869] text-black hover:bg-[#D3B869]/90"
                              onClick={() => handleCompleteBlock(block)}
                              disabled={completeBlock.isPending}
                            >
                              {completeBlock.isPending ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Completando...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Completar
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Panel Derecho: Estadísticas */}
          <div className="space-y-6">
            {/* Puntos de hoy */}
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
                    {todayPoints} PV
                  </p>
                  <p className="text-sm text-gray-400">
                    {todaySessionsData?.sessions.length || 0} bloques completados
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas generales */}
            {statsData && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-[#D3B869] flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Estadísticas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400">Total de sesiones</p>
                    <p className="text-2xl font-bold text-white">
                      {statsData.total_sessions}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Puntos totales</p>
                    <p className="text-2xl font-bold text-[#D3B869]">
                      {statsData.total_vitality_points} PV
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Este mes</p>
                    <p className="text-xl font-bold text-white">
                      {statsData.month_sessions} sesiones
                    </p>
                    <p className="text-sm text-[#D3B869]">
                      {statsData.month_vitality_points} PV
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sesiones de hoy */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869]">Sesiones de Hoy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {todaySessionsData?.sessions && todaySessionsData.sessions.length > 0 ? (
                    todaySessionsData.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-700 p-3 rounded-lg"
                      >
                        <p className="font-medium text-white">{session.block_title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-400">
                            {new Date(session.completed_at).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                          <span className="text-[#D3B869] font-bold">
                            +{session.vitality_points_earned} PV
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No has completado bloques hoy
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

export default TrainingBlocksPage;
