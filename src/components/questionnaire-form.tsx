'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronRight, Edit3 } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  type: 'single_choice' | 'multi_choice' | 'text' | 'number';
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  required?: boolean;
}

interface QuestionnaireFormProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string | string[]>) => void;
  onSkip: () => void;
}

export function QuestionnaireForm({ questions, onSubmit, onSkip }: QuestionnaireFormProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [customInput, setCustomInput] = useState('');

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelect = (value: string) => {
    if (currentQuestion.type === 'multi_choice') {
      const current = (answers[currentQuestion.id] as string[]) || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswers({ ...answers, [currentQuestion.id]: newValues });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // 添加自定义输入
      if (customInput) {
        setAnswers({ ...answers, custom: customInput });
      }
      onSubmit(answers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCustomInput('');
    }
  };

  const handleSkip = () => {
    if (isLastQuestion) {
      onSkip();
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const canProceed = () => {
    if (currentQuestion.required) {
      return answers[currentQuestion.id] !== undefined;
    }
    return true;
  };

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          问题 {currentQuestionIndex + 1} / {questions.length}
        </span>
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 w-6 rounded-full ${
                idx <= currentQuestionIndex ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div>
        <h4 className="mb-3 text-sm font-medium text-foreground">
          {currentQuestion.question}
        </h4>

        {/* Options */}
        {currentQuestion.options && (
          <div className="space-y-2">
            {currentQuestion.options.map((option, idx) => {
              const isSelected =
                currentQuestion.type === 'multi_choice'
                  ? ((answers[currentQuestion.id] as string[]) || []).includes(option.value)
                  : answers[currentQuestion.id] === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all ${
                    isSelected
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-foreground hover:border-emerald-200 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="flex-1">{option.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                  {!isSelected && <ChevronRight className="h-4 w-4 text-slate-400" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Text input */}
        {currentQuestion.type === 'text' && (
          <Textarea
            placeholder={currentQuestion.placeholder || '请输入...'}
            value={(answers[currentQuestion.id] as string) || ''}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
            }
            className="min-h-[80px]"
          />
        )}

        {/* Number input */}
        {currentQuestion.type === 'number' && (
          <Input
            type="number"
            placeholder={currentQuestion.placeholder || '请输入数字...'}
            value={(answers[currentQuestion.id] as string) || ''}
            onChange={(e) =>
              setAnswers({ ...answers, [currentQuestion.id]: e.target.value })
            }
          />
        )}
      </div>

      {/* Custom input for additional info */}
      {isLastQuestion && (
        <div className="border-t pt-3">
          <label className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Edit3 className="h-3 w-3" />
            其他补充信息（可选）
          </label>
          <Input
            placeholder="还有什么想告诉我的吗？"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t pt-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground"
        >
          跳过
        </Button>
        <Button
          size="sm"
          onClick={handleNext}
          disabled={!canProceed()}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLastQuestion ? '开始执行' : '下一步'}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
