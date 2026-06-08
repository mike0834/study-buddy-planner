import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthUser } from "@/lib/auth";

interface LoginFormProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim()) return;

    onLogin({
      name: name.trim(),
      email: email.trim(),
    });
  };

  return (
    <div className="min-h-screen gradient-soft flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-elegant">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">RevoStudy 로그인</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            이름과 이메일을 입력하고 나만의 복습 플래너를 시작하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">이름</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="예: 홍길동"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">이메일</label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@email.com"
            />
          </div>

          <Button type="submit" variant="hero" className="w-full">
            로그인
          </Button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          현재 로그인 정보는 이 브라우저에만 저장됩니다.
        </p>
      </Card>
    </div>
  );
};
