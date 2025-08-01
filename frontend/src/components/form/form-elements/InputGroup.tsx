import ComponentCard from "../../common/ComponentCard";
import Label from "../Label";
import Input from "../input/InputField";
// import { ICONS } from "@/helpers/icons";
import { Icon } from '../../common/Icon';
import PhoneInput from "../group-input/PhoneInput";

export default function InputGroup() {
  const countries = [
    { code: "US", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "CA", label: "+1" },
    { code: "AU", label: "+61" },
  ];
  const handlePhoneNumberChange = (phoneNumber: string) => {
    console.log("Updated phone number:", phoneNumber);
  };
  return (
    <ComponentCard title="Группа полей ввода">
      <div className="space-y-6">
        <div>
          <Label>Email</Label>
          <div className="relative">
            <Input
              placeholder="info@gmail.com"
              type="text"
              className="pl-[62px]"
            />
            <span className="absolute left-0 top-1/2 -translate-y-1/2 border-r border-gray-200 px-3.5 py-3 text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <Icon name="ENVELOPE" size={6} alt="Envelope icon" />
            </span>
          </div>
        </div>
        <div>
          <Label>Телефон</Label>
          <PhoneInput
            selectPosition="start"
            countries={countries}
            placeholder="+7 (999) 000-00-00"
            onChange={handlePhoneNumberChange}
          />
        </div>{" "}
        <div>
          <Label>Телефон</Label>
          <PhoneInput
            selectPosition="end"
            countries={countries}
            placeholder="+7 (999) 000-00-00"
            onChange={handlePhoneNumberChange}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
