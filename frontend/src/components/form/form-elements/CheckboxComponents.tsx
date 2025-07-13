import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { Checkbox } from "@/components/atoms/Checkbox";
import { Label } from "@/components/atoms/Label";

export default function CheckboxComponents() {
  const [isChecked, setIsChecked] = useState(false);
  const [isCheckedTwo, setIsCheckedTwo] = useState(true);
  const [isCheckedDisabled, setIsCheckedDisabled] = useState(false);
  return (
    <ComponentCard title="Checkbox">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox id="checkbox-demo-1" checked={isChecked} onCheckedChange={setIsChecked} />
          <Label htmlFor="checkbox-demo-1">
            Default
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="checkbox-demo-2" checked={isCheckedTwo} onCheckedChange={setIsCheckedTwo} />
          <Label htmlFor="checkbox-demo-2">
            Checked
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="checkbox-demo-3" checked={isCheckedDisabled} onCheckedChange={setIsCheckedDisabled} disabled />
          <Label htmlFor="checkbox-demo-3">
            Disabled
          </Label>
        </div>
      </div>
    </ComponentCard>
  );
}
