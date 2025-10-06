/**
 * Evaluations Page - IMC Calculator
 * Sistema de evaluaciones básico con IMC
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCalculateIMC, useCreateEvaluation, useLatestEvaluation } from '@/hooks/api/use-evaluations';
import { Calculator, History, TrendingUp } from 'lucide-react';

const EvaluationsPage: React.FC = () => {
  const { toast } = useToast();
  const [weight, setWeight] = React.useState('');
  const [height, setHeight] = React.useState('');
  const [result, setResult] = React.useState<any>(null);

  const calculateIMC = useCalculateIMC();
  const createEvaluation = useCreateEvaluation();
  const { data: latestIMC } = useLatestEvaluation('imc');

  const handleCalculate = async () => {
    if (!weight || !height) {
      toast({
        title: 'Datos incompletos',
        description: 'Por favor ingresa peso y altura',
        variant: 'destructive',
      });
      return;
    }

    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);

    if (isNaN(weightNum) || isNaN(heightNum)) {
      toast({
        title: 'Datos inválidos',
        description: 'Por favor ingresa valores numéricos válidos',
        variant: 'destructive',
      });
      return;
    }

    try {
      const imcResult = await calculateIMC.mutateAsync({
        weight: weightNum,
        height: heightNum,
      });

      setResult(imcResult);

      toast({
        title: 'IMC Calculado',
        description: `Tu IMC es ${imcResult.imc} - ${imcResult.category}`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Error calculating IMC:', error);
      toast({
        title: 'Error',
        description: 'No se pudo calcular el IMC',
        variant: 'destructive',
      });
    }
  };

  const handleSaveEvaluation = async () => {
    if (!result) return;

    try {
      await createEvaluation.mutateAsync({
        type: 'imc',
        data: {
          weight: parseFloat(weight),
          height: parseFloat(height),
          imc: result.imc,
          category: result.category,
        },
        interpretation: result.recommendation,
      });

      toast({
        title: 'Evaluación guardada',
        description: 'Tu evaluación de IMC ha sido guardada exitosamente',
        variant: 'default',
      });

      setResult(null);
      setWeight('');
      setHeight('');
    } catch (error) {
      console.error('Error saving evaluation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la evaluación',
        variant: 'destructive',
      });
    }
  };

  const getIMCColor = (imc: number) => {
    if (imc < 18.5) return 'text-blue-400';
    if (imc < 25) return 'text-green-400';
    if (imc < 30) return 'text-yellow-400';
    if (imc < 35) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#D3B869] mb-2">
            Evaluaciones de Salud
          </h1>
          <p className="text-gray-400">Calculadora de Índice de Masa Corporal (IMC)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calculator */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869] flex items-center gap-2">
                  <Calculator size={24} />
                  Calcular IMC
                </CardTitle>
                <CardDescription className="text-gray-400">
                  El IMC es un indicador simple de la relación entre tu peso y tu altura
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight" className="text-white mb-2">
                        Peso (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="70.0"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-white mb-2">
                        Altura (m)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        step="0.01"
                        placeholder="1.75"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    disabled={calculateIMC.isPending}
                    className="w-full bg-[#D3B869] text-black hover:bg-[#D3B869]/90"
                  >
                    {calculateIMC.isPending ? 'Calculando...' : 'Calcular IMC'}
                  </Button>

                  {result && (
                    <div className="mt-6 p-6 bg-gray-700 rounded-lg space-y-4">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-2">Tu IMC es</div>
                        <div className={`text-6xl font-bold ${getIMCColor(result.imc)}`}>
                          {result.imc}
                        </div>
                        <div className="text-xl text-white mt-2">{result.category}</div>
                      </div>

                      <div className="border-t border-gray-600 pt-4">
                        <div className="text-sm text-gray-400 mb-2">Recomendación:</div>
                        <p className="text-white">{result.recommendation}</p>
                      </div>

                      <Button
                        onClick={handleSaveEvaluation}
                        disabled={createEvaluation.isPending}
                        className="w-full bg-green-600 text-white hover:bg-green-700"
                      >
                        {createEvaluation.isPending ? 'Guardando...' : 'Guardar Evaluación'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* IMC Reference Table */}
            <Card className="bg-gray-800 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-[#D3B869] flex items-center gap-2">
                  <TrendingUp size={20} />
                  Tabla de Referencia IMC
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span className="text-blue-400">Menos de 18.5</span>
                    <span className="text-white">Bajo peso</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span className="text-green-400">18.5 - 24.9</span>
                    <span className="text-white">Peso normal</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span className="text-yellow-400">25.0 - 29.9</span>
                    <span className="text-white">Sobrepeso</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span className="text-orange-400">30.0 - 34.9</span>
                    <span className="text-white">Obesidad I</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span className="text-orange-500">35.0 - 39.9</span>
                    <span className="text-white">Obesidad II</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-700 rounded">
                    <span className="text-red-400">40.0 o más</span>
                    <span className="text-white">Obesidad III</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Latest Evaluation */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-[#D3B869] flex items-center gap-2">
                  <History size={20} />
                  Última Evaluación
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latestIMC ? (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gray-700 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">IMC</div>
                      <div className={`text-4xl font-bold ${getIMCColor(latestIMC.data.imc)}`}>
                        {latestIMC.data.imc}
                      </div>
                      <div className="text-sm text-white mt-1">{latestIMC.data.category}</div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Peso:</span>
                        <span className="text-white">{latestIMC.data.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Altura:</span>
                        <span className="text-white">{latestIMC.data.height} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fecha:</span>
                        <span className="text-white">
                          {new Date(latestIMC.created_at).toLocaleDateString('es-ES')}
                        </span>
                      </div>
                    </div>

                    {latestIMC.interpretation && (
                      <div className="border-t border-gray-600 pt-3">
                        <div className="text-xs text-gray-400 mb-1">Recomendación:</div>
                        <p className="text-sm text-white">{latestIMC.interpretation}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <p>No hay evaluaciones previas</p>
                    <p className="text-sm mt-2">Realiza tu primera evaluación</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsPage;
