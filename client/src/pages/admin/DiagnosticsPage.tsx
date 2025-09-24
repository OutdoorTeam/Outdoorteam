import * as React from 'react';

export default function DiagnosticsPage() {
  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-semibold">Diagnósticos</h2>
      <p className="text-sm text-muted-foreground">
        Vista de diagnóstico temporal. Aquí mostraremos estado de APIs, DB y logs.
      </p>
    </div>
  );
}
