import { useState } from "react";
import DatePickerPopup from "./DatePickerPopup";

export default function DatePickerInput({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      {label && <label className="block text-sm mb-1 text-gray-300">{label}</label>}

      <input
        readOnly
        value={value}
        placeholder="dd/mm/yyyy"
        onClick={() => setOpen(true)}
        disabled={disabled}
        className="w-full bg-gray-900/60 border border-gray-700 rounded-md px-3 py-2 cursor-pointer text-white focus:ring-2 focus:ring-cyan-500"
      />

      <DatePickerPopup
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(date) => {
          const formatted = `${date.getDate().toString().padStart(2, "0")}/${
            (date.getMonth() + 1).toString().padStart(2, "0")
          }/${date.getFullYear()}`;
          onChange(formatted);
          setOpen(false);
        }}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
}
