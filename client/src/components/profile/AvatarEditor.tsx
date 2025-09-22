import React from 'react';
import { AvatarConfig, useUpdateAvatar } from '@/hooks/api/use-avatar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface AvatarEditorProps {
  avatar: AvatarConfig;
  onClose: () => void;
}

const options = {
  gender: ['female', 'male', 'non-binary'],
  skin_tone: ['#f2d5b1', '#d1a377', '#a07c5e', '#6a4f3a'],
  hair_style: ['long', 'short', 'ponytail'],
  hair_color: ['#3b2219', '#ffcc00', '#e67e22', '#95a5a6'],
  shirt_color: ['#5a67d8', '#38a169', '#d53f8c', '#f56565'],
  pants_color: ['#333333', '#4a5568', '#2c5282', '#975a16'],
  accessory: ['none', 'glasses'],
};

const AvatarEditor: React.FC<AvatarEditorProps> = ({ avatar, onClose }) => {
  const [config, setConfig] = React.useState(avatar);
  const updateAvatarMutation = useUpdateAvatar();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateAvatarMutation.mutateAsync(config);
      toast({ title: 'Avatar guardado', description: 'Tu avatar ha sido actualizado.', variant: 'success' });
      onClose();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar el avatar.', variant: 'destructive' });
    }
  };

  const handleSelectChange = (field: keyof AvatarConfig) => (value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalizar Avatar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Género</Label>
            <Select value={config.gender} onValueChange={handleSelectChange('gender')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {options.gender.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Tono de Piel</Label>
            <div className="flex gap-2 mt-2">
              {options.skin_tone.map(color => (
                <button key={color} onClick={() => setConfig(p => ({...p, skin_tone: color}))} className={`w-8 h-8 rounded-full border-2 ${config.skin_tone === color ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Estilo de Pelo</Label>
            <Select value={config.hair_style} onValueChange={handleSelectChange('hair_style')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {options.hair_style.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Color de Pelo</Label>
            <div className="flex gap-2 mt-2">
              {options.hair_color.map(color => (
                <button key={color} onClick={() => setConfig(p => ({...p, hair_color: color}))} className={`w-8 h-8 rounded-full border-2 ${config.hair_color === color ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Color de Camisa</Label>
            <div className="flex gap-2 mt-2">
              {options.shirt_color.map(color => (
                <button key={color} onClick={() => setConfig(p => ({...p, shirt_color: color}))} className={`w-8 h-8 rounded-full border-2 ${config.shirt_color === color ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Color de Pantalón</Label>
            <div className="flex gap-2 mt-2">
              {options.pants_color.map(color => (
                <button key={color} onClick={() => setConfig(p => ({...p, pants_color: color}))} className={`w-8 h-8 rounded-full border-2 ${config.pants_color === color ? 'border-primary' : 'border-transparent'}`} style={{ backgroundColor: color }} />
              ))}
            </div>
          </div>
          <div>
            <Label>Accesorio</Label>
            <Select value={config.accessory} onValueChange={handleSelectChange('accessory')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {options.accessory.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={updateAvatarMutation.isPending}>
            {updateAvatarMutation.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarEditor;
