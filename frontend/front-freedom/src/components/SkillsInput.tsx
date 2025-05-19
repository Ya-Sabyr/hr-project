import { useState } from "react";
import { X } from "lucide-react";

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsInput({ value, onChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (newSkill && !value.includes(newSkill)) {
        onChange([...value, newSkill]);
        setInputValue("");
      }
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter((skill) => skill !== skillToRemove));
  };

  return (
    <div className="mb-8">
      <label className="block mb-2">
        Ключевые навыки <span className="text-red-500">*</span>
      </label>
      <div className="flex flex-wrap gap-2 border p-2 rounded w-full">
        {Array.isArray(value)
          ? value.map((skill, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-md"
              >
                {skill}
                <X
                  className="ml-2 cursor-pointer hover:text-gray-300"
                  size={16}
                  onClick={() => removeSkill(skill)}
                />
              </div>
            ))
          : null}

        <input
          type="text"
          placeholder="Введите навык и нажмите Enter или запятую"
          className="flex-1 p-2 border-none outline-none"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}