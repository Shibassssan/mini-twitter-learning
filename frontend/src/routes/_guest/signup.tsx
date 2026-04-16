import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@apollo/client/react";
import { Button, TextField, Label, Input, FieldError, Spinner } from "@heroui/react";
import { signUpSchema, type SignUpFormValues } from "@/lib/validations/auth";
import { SignUpDocument } from "@/lib/graphql/generated/graphql";
import { useAuthStore } from "@/lib/stores/authStore";
import { extractGqlErrorMessage } from "@/lib/utils/graphqlError";

export const Route = createFileRoute("/_guest/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [signUp, { loading }] = useMutation(SignUpDocument);
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
      if(!data?.signUp) {
        throw new Error("登録に失敗しました");
      }

      setAuth(data.signUp.user, data.signUp.accessToken);
      navigate({ to: "/" });
    } catch (e: unknown) {
      setError("root", { message: extractGqlErrorMessage(e, "登録に失敗しました") });
    }
  };

  return (
    <div className="bg-content1 rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-center">MiniTwitter</h1>
      <p className="text-default-500 text-sm text-center mb-6">
        新規アカウント登録
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField isInvalid={!!errors.username} name="username">
          <Label>ユーザー名</Label>
          <Input
            {...register("username")}
            fullWidth
            type="text"
            autoComplete="username"
            placeholder="例: john_doe"
          />
          {errors.username && <FieldError>{errors.username.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.displayName} name="displayName">
          <Label>表示名</Label>
          <Input
            {...register("displayName")}
            fullWidth
            type="text"
            autoComplete="name"
            placeholder="例: John Doe"
          />
          {errors.displayName && <FieldError>{errors.displayName.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.email} name="email">
          <Label>メールアドレス</Label>
          <Input
            {...register("email")}
            fullWidth
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.password} name="password">
          <Label>パスワード</Label>
          <Input
            {...register("password")}
            fullWidth
            type="password"
            autoComplete="new-password"
            placeholder="8文字以上"
          />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.passwordConfirm} name="passwordConfirm">
          <Label>パスワード（確認）</Label>
          <Input
            {...register("passwordConfirm")}
            fullWidth
            type="password"
            autoComplete="new-password"
            placeholder="もう一度入力"
          />
          {errors.passwordConfirm && <FieldError>{errors.passwordConfirm.message}</FieldError>}
        </TextField>
        {errors.root && (
          <p className="text-danger text-sm">{errors.root.message}</p>
        )}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={loading}
          isPending={loading}
          className="mt-2"
        >
          {({isPending}) => isPending ? <><Spinner color="current" size="sm" />登録中...</> : "新規登録"}
        </Button>
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
