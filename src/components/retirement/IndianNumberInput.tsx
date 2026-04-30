import * as React from "react";
import { Input } from "@/components/ui/input";

interface Props {
  id?: string;
  value: number;
  onChange: (n: number) => void;
  className?: string;
  placeholder?: string;
}

const groupIN = (digits: string): string => {
  // Strip leading zeros (but keep "0")
  const cleaned = digits.replace(/^0+(?=\d)/, "");
  if (!cleaned) return "";
  const n = Number(cleaned);
  if (!isFinite(n)) return "";
  return n.toLocaleString("en-IN");
};

/**
 * Number input that displays values with the Indian comma system
 * (1,23,45,678) live as the user types. Calls onChange with the parsed
 * numeric value.
 */
export function IndianNumberInput({ id, value, onChange, className, placeholder }: Props) {
  const [text, setText] = React.useState<string>(value ? groupIN(String(Math.round(value))) : "");

  // Keep local text in sync when parent value changes externally (e.g. reset)
  React.useEffect(() => {
    const numericFromText = Number(text.replace(/,/g, ""));
    if (numericFromText !== value) {
      setText(value ? groupIN(String(Math.round(value))) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, "");
    const formatted = groupIN(raw);
    setText(formatted);
    onChange(raw === "" ? 0 : Number(raw));
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      value={text}
      onChange={handle}
      className={className}
      placeholder={placeholder}
    />
  );
}
