import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import { RadioGroup } from "@/components/atoms/RadioGroup";
import { RadioGroupItem } from "@/components/atoms/RadioGroupItem";
import { Label } from "@/components/atoms/Label";


export default function RadioButtons() {
  const [selectedValue, setSelectedValue] = useState<string>("option2");

  return (
    <ComponentCard title="Radio Buttons">
      <RadioGroup defaultValue={selectedValue} onValueChange={setSelectedValue} className="flex flex-wrap items-center gap-8">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option1" id="radio-demo-1" />
          <Label htmlFor="radio-demo-1">Default</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option2" id="radio-demo-2" />
          <Label htmlFor="radio-demo-2">Selected</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="option3" id="radio-demo-3" disabled />
          <Label htmlFor="radio-demo-3">Disabled</Label>
        </div>
      </RadioGroup>
    </ComponentCard>
  );
}
