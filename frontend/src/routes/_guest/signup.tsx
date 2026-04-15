import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { signUpSchema, type SignUpFormValues } from "@/lib/validations/auth";
import { SIGN_UP_MUTATION } from "@/lib/graphql/operations/auth";
import { useAuthStore } from "@/lib/stores/authStore";

export const Route = createFileRoute("/_guest/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [signUp, { loading }] = useMutation(SIGN_UP_MUTATION);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      const { data } = await signUp({
        variables: {
          username: values.username,
          displayName: values.displayName,
          email: values.email,
          password: values.password,
        },
      });
      if(!data) {
        throw new Error("登録に失敗しました");
      }

      setAuth(data.signUp.user, data.signUp.accessToken);
      navigate({ to: "/" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "登録に失敗しました";
      setError("root", { message: msg });
    }
  };

  return (
    <div className="bg-content1 rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-center">MiniTwitter</h1>
      <p className="text-default-500 text-sm text-center mb-6">
        新規アカウント登録
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">ユーザー名</label>
          <input
            {...register("username")}
            type="text"
            autoComplete="username"
            placeholder="例: john_doe"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.username && (
            <p className="text-danger text-xs mt-1">
              {errors.username.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">表示名</label>
          <input
            {...register("displayName")}
            type="text"
            autoComplete="name"
            placeholder="例: John Doe"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.displayName && (
            <p className="text-danger text-xs mt-1">
              {errors.displayName.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">メールアドレス</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.email && (
            <p className="text-danger text-xs mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">パスワード</label>
          <input
            {...register("password")}
            type="password"
            autoComplete="new-password"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.password && (
            <p className="text-danger text-xs mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">パスワード（確認）</label>
          <input
            {...register("passwordConfirm")}
            type="password"
            autoComplete="new-password"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.passwordConfirm && (
            <p className="text-danger text-xs mt-1">
              {errors.passwordConfirm.message}
            </p>
          )}
        </div>
        {errors.root && (
          <p className="text-danger text-sm">{errors.root.message}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded-lg py-2 font-medium disabled:opacity-50 mt-2"
        >
          {loading ? "登録中..." : "新規登録"}
        </button>
      </form>
      <p className="text-center text-sm mt-4 text-default-500">
        すでにアカウントをお持ちの方は{" "}
        <Link to="/login" className="text-primary hover:underline">
          ログイン
        </Link>
      </p>
    </div>
  );
}
