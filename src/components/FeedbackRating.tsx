import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const EMOJIS = [
  { value: 1, char: "😢", label: "Pessimo" },
  { value: 2, char: "🙁", label: "Non buono" },
  { value: 3, char: "😐", label: "Neutro" },
  { value: 4, char: "🙂", label: "Buono" },
  { value: 5, char: "😄", label: "Ottimo" },
];

const FeedbackRating = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState<string>("Anonimo");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        setUserId(u.id);
        const meta = (u.user_metadata || {}) as Record<string, string>;
        const name =
          meta.full_name ||
          [meta.first_name, meta.last_name].filter(Boolean).join(" ") ||
          u.email ||
          "Utente";
        setUserName(name);
      }
    });
  }, []);

  const handleSelect = async (value: number) => {
    if (loading || submitted) return;
    setSelected(value);
    setLoading(true);
    try {
      const { error } = await (supabase.from("feedback") as any).insert({
        rating: value,
        display_name: userId ? userName : "Anonimo",
        user_id: userId,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Grazie per il feedback!");
    } catch (e) {
      console.error(e);
      toast.error("Errore invio feedback");
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4">
      <div className="bg-white rounded-3xl border border-black/5 shadow-sm p-5 space-y-4">
        <h3 className="text-lg font-extrabold text-foreground text-center">
          Cosa diresti ai tuoi amici di Wealink?
        </h3>
        <div className="flex items-center justify-between gap-2">
          {EMOJIS.map((e) => {
            const isActive = selected === e.value;
            return (
              <button
                key={e.value}
                onClick={() => handleSelect(e.value)}
                disabled={loading || submitted}
                aria-label={e.label}
                className={`flex-1 aspect-square rounded-2xl text-3xl transition-all flex items-center justify-center ${
                  isActive
                    ? "bg-[#9ED5AE] scale-110 ring-2 ring-[#0F3D2E]"
                    : "bg-black/5 hover:bg-black/10"
                } ${submitted && !isActive ? "opacity-40" : ""}`}
              >
                {e.char}
              </button>
            );
          })}
        </div>
        {submitted && (
          <p className="text-center text-sm font-bold text-[#1F5E3E]">
            Feedback inviato come <span className="underline">{userId ? userName : "Anonimo"}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default FeedbackRating;
