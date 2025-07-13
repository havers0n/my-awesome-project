import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Switch } from "@/components/atoms/Switch";
import { Label } from "@/components/atoms/Label";

export default function ToggleSwitch() {
  const [checked1, setChecked1] = useState(true);
  const [checked2, setChecked2] = useState(false);

  return (
    <ComponentCard title="Toggle switch input">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center space-x-2">
            <Switch id="ts-demo-1" checked={checked1} onCheckedChange={setChecked1} />
            <Label htmlFor="ts-demo-1">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="ts-demo-2" checked={checked2} onCheckedChange={setChecked2}/>
            <Label htmlFor="ts-demo-2">Unchecked</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="ts-demo-3" disabled />
            <Label htmlFor="ts-demo-3">Disabled</Label>
        </div>
        <div className="flex items-center space-x-2">
            <Switch id="ts-demo-4" checked variant="error" />
            <Label htmlFor="ts-demo-4" className="text-destructive">Error</Label>
        </div>
      </div>
    </ComponentCard>
  );
}
