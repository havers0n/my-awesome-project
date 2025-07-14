import { useState } from "react";
import Form from "../form/Form";

interface FeedbackFormProps {
  buttonName?: string;
  onSubmit?: (text: string) => void;
  style?: React.CSSProperties;
}

import { logUXEvent } from "@/utils/uxLogger";

const FeedbackForm: React.FC<FeedbackFormProps> = ({ buttonName = "Оставить отзыв", onSubmit, style }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSend = () => {
    logUXEvent('feedback_submitted', { text });
    if (onSubmit) onSubmit(text);
    setSubmitted(true);
    setTimeout(() => {
      setOpen(false);
      setText("");
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div style={style}>
      <button type="button" onClick={() => setOpen(v => !v)} className="ml-2 text-xs">
        {buttonName}
      </button>
      {open && (
        <Form
          onSubmit={e => {
            e.preventDefault();
            if (text.length > 2) handleSend();
          }}
          className="flex flex-col mt-2 gap-2 p-2 border border-gray-200 rounded-lg shadow"
        >
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Ваш отзыв..."
            rows={3}
            className="resize-y rounded border p-1 w-full text-xs"
          />
          <div className="flex justify-end items-center gap-2">
            <button type="button" onClick={() => setOpen(false)} className="text-gray-400 text-xs">Отмена</button>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs" disabled={text.length<3}>{submitted ? 'Спасибо!' : 'Отправить'}</button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default FeedbackForm;

