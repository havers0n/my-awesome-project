import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Select from "../Select";
import MultiSelect from "../MultiSelect";

export default function SelectInputs() {
  const options = [
    { value: "marketing", label: "Маркетинг" },
    { value: "template", label: "Шаблон" },
    { value: "development", label: "Разработка" },
  ];
  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const multiOptions = [
    { value: "1", text: "Вариант 1", selected: false },
    { value: "2", text: "Вариант 2", selected: false },
    { value: "3", text: "Вариант 3", selected: false },
    { value: "4", text: "Вариант 4", selected: false },
    { value: "5", text: "Вариант 5", selected: false },
  ];
  return (
    <ComponentCard title="Выпадающие списки">
      <div className="space-y-6">
        <div>
          <Label>Выпадающий список</Label>
          <Select
            options={options}
            placeholder="Выберите вариант"
            onChange={handleSelectChange}
            className="dark:bg-dark-900"
          />
        </div>
        <div>
          <MultiSelect
            label="Множественный выбор"
            options={multiOptions}
            defaultSelected={["1", "3"]}
            onChange={(values) => setSelectedValues(values)}
          />
          <p className="sr-only">
            Выбранные значения: {selectedValues.join(", ")}
          </p>
        </div>
      </div>
    </ComponentCard>
  );
}
