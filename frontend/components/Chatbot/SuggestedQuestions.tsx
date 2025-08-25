import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "What are the current NFL playoff standings?",
  "Which teams have the strongest strength of schedule?",
  "Who are the top performers by position this season?",
  "What are the key injury reports affecting teams?",
  "Which rookies are having breakout seasons?",
  "How do weather conditions affect team performance?"
];

export const SuggestedQuestions = ({ onSelectQuestion }: SuggestedQuestionsProps) => {
  return (
    <div className="p-4 border-b border-border bg-card">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Questions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSelectQuestion(question)}
            className="justify-start text-left h-auto py-2 px-3 text-xs border-border hover:bg-secondary hover:border-primary/50 transition-all"
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};