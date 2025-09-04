import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Dumbbell, Package } from 'lucide-react';
import NutritionPlanAdmin from './nutrition/NutritionPlanAdmin';
import TrainingPlanAdmin from './training/TrainingPlanAdmin';
import PlansConfiguration from '@/components/admin/PlansConfiguration';

const PlansManagementPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestión de Planes</h1>
        <p className="text-muted-foreground">
          Administra los planes de servicio, nutrición y entrenamiento para los usuarios
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Planes de Servicio
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Apple className="w-4 h-4" />
            Nutrición
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Entrenamiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <PlansConfiguration />
        </TabsContent>

        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="w-5 h-5 text-[#D3B869]" />
                Planes de Nutrición
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NutritionPlanAdmin />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#D3B869]" />
                Planes de Entrenamiento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrainingPlanAdmin />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlansManagementPage;
