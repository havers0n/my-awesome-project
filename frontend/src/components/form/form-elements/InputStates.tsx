import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Input from "../input/InputField";
import Label from "../Label";
export default function InputStates() {
  const [email, setEmail] = useState("");
  const [emailTwo, setEmailTwo] = useState("");
  const [error, setError] = useState(false);

  // Simulate a validation check
  const validateEmail = (value: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setError(!isValidEmail);
    return isValidEmail;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  const handleEmailTwoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailTwo(value);
    validateEmail(value);
  };
  return (
    <ComponentCard
      title="Состояния поля ввода"
      desc="Стили валидации для ошибок, успеха и неактивных полей."
    >
      <div className="space-y-5 sm:space-y-6">
        {/* Error Input */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={email}
            error={error}
            onChange={handleEmailChange}
            placeholder="Введите ваш email"
            hint={error ? "Некорректный адрес электронной почты." : ""}
          />
        </div>

        {/* Success Input */}
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={emailTwo}
            success={!error}
            onChange={handleEmailTwoChange}
            placeholder="Введите ваш email"
            hint={!error ? "Успешно." : ""}
          />
        </div>

        {/* Disabled Input */}
        <div>
          <Label>Email</Label>
          <Input
            type="text"
            value="disabled@example.com"
            disabled={true}
            placeholder="Email отключён"
          />
        </div>
      </div>
    </ComponentCard>
  );
}
