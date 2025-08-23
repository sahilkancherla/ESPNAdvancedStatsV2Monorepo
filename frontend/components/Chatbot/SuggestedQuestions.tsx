import { Button } from "@/components/ui/button";

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  "Who should I start at QB this week?",
  "What's the trade value of Tyreek Hill?",
  "Best waiver wire pickups this week?",
  "Should I trade my RB1 for two WR2s?",
  "Which defense has the easiest schedule?",
  "Who are the top rookie fantasy players?"
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